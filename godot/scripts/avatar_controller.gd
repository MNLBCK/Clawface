extends Node2D

@export var websocket_url := "ws://127.0.0.1:8765/ws/avatar"
@export var mouth_height := 70.0

var _socket := WebSocketPeer.new()
var _mouth_open := 0.0
var _emotion := "neutral"

@onready var mouth: Polygon2D = $Mouth
@onready var expression_label: Label = $ExpressionLabel

func _ready() -> void:
	_socket.connect_to_url(websocket_url)

func _process(delta: float) -> void:
	_socket.poll()
	while _socket.get_available_packet_count() > 0:
		_handle_message(_socket.get_packet().get_string_from_utf8())
	_mouth_open = lerpf(_mouth_open, 0.0, delta * 3.0)
	_update_mouth()

func _handle_message(raw: String) -> void:
	var parsed = JSON.parse_string(raw)
	if typeof(parsed) != TYPE_DICTIONARY:
		return
	var payload: Dictionary = parsed.get("payload", {})
	match parsed.get("type", ""):
		"lip_sync":
			_mouth_open = clampf(float(payload.get("mouth_open", 0.0)), 0.0, 1.0)
		"emotion":
			_emotion = str(payload.get("emotion", "neutral"))
			expression_label.text = _emotion

func _update_mouth() -> void:
	var half_width := 55.0
	var open_height := 8.0 + (_mouth_open * mouth_height)
	mouth.polygon = PackedVector2Array([
		Vector2(-half_width, 60.0),
		Vector2(half_width, 60.0),
		Vector2(half_width, 60.0 + open_height),
		Vector2(-half_width, 60.0 + open_height),
	])
