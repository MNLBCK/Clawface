extends Node2D

@export var websocket_url := "ws://127.0.0.1:8765/ws/avatar"
@export var mouth_height := 70.0

var _socket := WebSocketPeer.new()
var _mouth_open := 0.0
var _emotion := "neutral"
var _connection_state := "disconnected"
var _protocol_compatible := false
var _reconnect_elapsed := 0.0
const RECONNECT_INTERVAL := 3.0

@onready var mouth: Polygon2D = $Mouth
@onready var expression_label: Label = $ExpressionLabel

func _ready() -> void:
	_connect_websocket("connecting")
	_update_status_label()

func _process(delta: float) -> void:
	_socket.poll()
	_update_connection_state(delta)
	if _socket.get_ready_state() == WebSocketPeer.STATE_OPEN:
		while _socket.get_available_packet_count() > 0:
			_handle_message(_socket.get_packet().get_string_from_utf8())
	_mouth_open = lerpf(_mouth_open, 0.0, delta * 3.0)
	_update_mouth()

func _connect_websocket(state: String) -> void:
	_protocol_compatible = false
	_socket = WebSocketPeer.new()
	var err := _socket.connect_to_url(websocket_url)
	_reconnect_elapsed = 0.0
	if err == OK:
		_set_connection_state(state)
	else:
		_set_connection_state("disconnected")

func _update_connection_state(delta: float) -> void:
	match _socket.get_ready_state():
		WebSocketPeer.STATE_CONNECTING:
			if _connection_state != "reconnecting":
				_set_connection_state("connecting")
		WebSocketPeer.STATE_OPEN:
			_reconnect_elapsed = 0.0
			if _protocol_compatible:
				_set_connection_state("compatible/connected")
			elif _connection_state != "incompatible":
				_set_connection_state("connecting")
		WebSocketPeer.STATE_CLOSING:
			_set_connection_state("disconnected")
		WebSocketPeer.STATE_CLOSED:
			_handle_reconnect(delta)

func _handle_reconnect(delta: float) -> void:
	_reconnect_elapsed += delta
	if _reconnect_elapsed >= RECONNECT_INTERVAL:
		_connect_websocket("reconnecting")
	elif _connection_state != "reconnecting":
		_set_connection_state("disconnected")

func _set_connection_state(state: String) -> void:
	if _connection_state == state:
		return
	_connection_state = state
	_update_status_label()

func _update_status_label() -> void:
	expression_label.text = "emotion: %s\nstatus: %s" % [_emotion, _connection_state]

func _handle_message(raw: String) -> void:
	var parsed = JSON.parse_string(raw)
	if typeof(parsed) != TYPE_DICTIONARY:
		return
	var payload: Dictionary = parsed.get("payload", {})
	match parsed.get("type", ""):
		"hello":
			_handle_hello(payload)
		"lip_sync":
			_mouth_open = clampf(float(payload.get("mouth_open", 0.0)), 0.0, 1.0)
		"emotion":
			_emotion = str(payload.get("emotion", "neutral"))
			_update_status_label()

func _handle_hello(payload: Dictionary) -> void:
	var supported_events_variant = payload.get("supported_events", [])
	var supported_events: Array = []
	if typeof(supported_events_variant) == TYPE_ARRAY:
		supported_events = supported_events_variant
	_protocol_compatible = supported_events.has("lip_sync") and supported_events.has("emotion")
	if _protocol_compatible:
		_set_connection_state("compatible/connected")
	else:
		_set_connection_state("incompatible")

func _update_mouth() -> void:
	var half_width := 55.0
	var open_height := 8.0 + (_mouth_open * mouth_height)
	mouth.polygon = PackedVector2Array([
		Vector2(-half_width, 60.0),
		Vector2(half_width, 60.0),
		Vector2(half_width, 60.0 + open_height),
		Vector2(-half_width, 60.0 + open_height),
	])
