extends Node2D

@onready var status_label: Label = $CanvasLayer/StatusLabel
@onready var avatar: Node2D = $Avatar

var socket := WebSocketPeer.new()
var connected := false

func _ready() -> void:
    var err := socket.connect_to_url("ws://127.0.0.1:8000/ws")
    if err != OK:
        status_label.text = "WebSocket error: %s" % err

func _process(_delta: float) -> void:
    socket.poll()
    var state := socket.get_ready_state()

    if state == WebSocketPeer.STATE_OPEN and not connected:
        connected = true
        status_label.text = "WebSocket: connected"
    elif state != WebSocketPeer.STATE_OPEN and connected:
        connected = false
        status_label.text = "WebSocket: disconnected"

    while state == WebSocketPeer.STATE_OPEN and socket.get_available_packet_count() > 0:
        var payload := JSON.parse_string(socket.get_packet().get_string_from_utf8())
        if payload is Dictionary:
            avatar.call("apply_avatar_payload", payload)
