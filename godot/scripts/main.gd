extends Node2D

const WS_URL := "ws://127.0.0.1:8000/ws"
const RECONNECT_INTERVAL_SECONDS := 2.0

@onready var status_label: Label = $CanvasLayer/StatusLabel
@onready var avatar = $Avatar

var socket := WebSocketPeer.new()
var connected := false
var reconnect_timer := 0.0

func _ready() -> void:
    _attempt_reconnect()

func _process(delta: float) -> void:
    socket.poll()
    var state := socket.get_ready_state()

    if state == WebSocketPeer.STATE_OPEN and not connected:
        connected = true
        status_label.text = "WebSocket: connected"
    elif state == WebSocketPeer.STATE_CLOSED and not connected:
        reconnect_timer -= delta
        if reconnect_timer <= 0.0:
            _attempt_reconnect()
    elif state != WebSocketPeer.STATE_OPEN and connected:
        connected = false
        status_label.text = "WebSocket: disconnected"

    while state == WebSocketPeer.STATE_OPEN and socket.get_available_packet_count() > 0:
        var payload := JSON.parse_string(socket.get_packet().get_string_from_utf8())
        if payload is Dictionary:
            avatar.apply_avatar_payload(payload)

func _attempt_reconnect() -> void:
    var err := socket.connect_to_url(WS_URL)
    reconnect_timer = RECONNECT_INTERVAL_SECONDS
    if err != OK:
        status_label.text = "WebSocket reconnect failed: %s" % err
