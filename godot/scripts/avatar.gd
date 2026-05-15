extends Node2D

const MIN_MOUTH_SCALE_Y := 0.7
const MAX_MOUTH_SCALE_Y := 1.6
const DEFAULT_HEAD_POSITION := Vector2(0.0, -80.0)
const BEGGING_HEAD_POSITION := Vector2(0.0, -72.0)
const IDLE_PULSE_PERIOD_MS := 450.0
const MIN_BLINK_INTERVAL := 1.6
const MAX_BLINK_INTERVAL := 3.3
const PUZZLED_TREMOR_DEGREES := 2.0

@onready var body: Node2D = $Body
@onready var head: Node2D = $Head
@onready var mouth_polygon: Polygon2D = $Head/MouthPolygon
@onready var mouth_bone_left: Bone2D = $Skeleton2D/MouthBoneLeft
@onready var mouth_bone_right: Bone2D = $Skeleton2D/MouthBoneRight
@onready var upper_eyelid_bone: Bone2D = $Skeleton2D/UpperEyelidBone
@onready var lower_eyelid_bone: Bone2D = $Skeleton2D/LowerEyelidBone
@onready var animation_player: AnimationPlayer = $AnimationPlayer

var current_emotion := "idle"
var blink_timer := 0.0
var puzzled_tremor_phase := 0.0

func _ready() -> void:
    _ensure_animation("idle", Vector2(1.0, 1.0), DEFAULT_HEAD_POSITION, 0.0, 0.0, 0.0)
    _ensure_animation("begging", Vector2(1.0, 1.0), BEGGING_HEAD_POSITION, 4.0, 8.0, -6.0)
    _ensure_animation("puzzled", Vector2(1.0, 1.0), DEFAULT_HEAD_POSITION, 0.0, -10.0, 7.0)
    animation_player.play("idle")

func apply_avatar_payload(payload: Dictionary) -> void:
    if payload.get("type") == "lip_sync":
        var amplitude := clamp(float(payload.get("amplitude", 0.0)), 0.0, 1.0)
        _apply_lip_sync(amplitude)

        var emotion := String(payload.get("emotion", "idle"))
        if emotion != current_emotion:
            current_emotion = emotion
            _apply_emotion_pose(current_emotion)

    elif payload.get("type") == "action":
        var trigger := String(payload.get("trigger", "idle"))
        current_emotion = trigger
        _apply_emotion_pose(current_emotion)

func _process(delta: float) -> void:
    if current_emotion == "idle":
        var pulse := 1.0 + 0.01 * sin(float(Time.get_ticks_msec()) / IDLE_PULSE_PERIOD_MS)
        body.scale.y = pulse
        blink_timer -= delta
        if blink_timer <= 0.0:
            upper_eyelid_bone.rotation_degrees = 10.0
            lower_eyelid_bone.rotation_degrees = -10.0
            blink_timer = randf_range(MIN_BLINK_INTERVAL, MAX_BLINK_INTERVAL)
        else:
            upper_eyelid_bone.rotation_degrees = lerp(upper_eyelid_bone.rotation_degrees, 0.0, 0.2)
            lower_eyelid_bone.rotation_degrees = lerp(lower_eyelid_bone.rotation_degrees, 0.0, 0.2)
    elif current_emotion == "puzzled":
        puzzled_tremor_phase += delta * 12.0

func _apply_lip_sync(amplitude: float) -> void:
    mouth_polygon.scale.y = lerp(MIN_MOUTH_SCALE_Y, MAX_MOUTH_SCALE_Y, amplitude)
    var tremor := 0.0
    if current_emotion == "puzzled":
        tremor = sin(puzzled_tremor_phase) * PUZZLED_TREMOR_DEGREES
    mouth_bone_left.rotation_degrees = lerp(-6.0, -25.0, amplitude) + tremor
    mouth_bone_right.rotation_degrees = lerp(6.0, 25.0, amplitude) - tremor

func _apply_emotion_pose(emotion: String) -> void:
    body.scale = Vector2.ONE
    head.position = DEFAULT_HEAD_POSITION
    head.rotation_degrees = 0.0
    upper_eyelid_bone.rotation_degrees = 0.0
    lower_eyelid_bone.rotation_degrees = 0.0
    if animation_player.has_animation(emotion):
        animation_player.play(emotion)

    match emotion:
        "begging":
            head.position = BEGGING_HEAD_POSITION
            head.rotation_degrees = 4.0
            upper_eyelid_bone.rotation_degrees = 8.0
            lower_eyelid_bone.rotation_degrees = -6.0
        "puzzled":
            upper_eyelid_bone.rotation_degrees = -10.0
            lower_eyelid_bone.rotation_degrees = 7.0
            puzzled_tremor_phase = 0.0

func _ensure_animation(
    name: String,
    body_scale: Vector2,
    head_position: Vector2,
    head_rotation: float,
    upper_eyelid_rotation: float,
    lower_eyelid_rotation: float
) -> void:
    if animation_player.has_animation(name):
        return

    var animation := Animation.new()
    animation.length = 0.2

    var body_track := animation.add_track(Animation.TYPE_VALUE)
    animation.track_set_path(body_track, NodePath("Body:scale"))
    animation.track_insert_key(body_track, 0.0, body_scale)

    var head_position_track := animation.add_track(Animation.TYPE_VALUE)
    animation.track_set_path(head_position_track, NodePath("Head:position"))
    animation.track_insert_key(head_position_track, 0.0, head_position)

    var head_rotation_track := animation.add_track(Animation.TYPE_VALUE)
    animation.track_set_path(head_rotation_track, NodePath("Head:rotation_degrees"))
    animation.track_insert_key(head_rotation_track, 0.0, head_rotation)

    var upper_eyelid_track := animation.add_track(Animation.TYPE_VALUE)
    animation.track_set_path(upper_eyelid_track, NodePath("Skeleton2D/UpperEyelidBone:rotation_degrees"))
    animation.track_insert_key(upper_eyelid_track, 0.0, upper_eyelid_rotation)

    var lower_eyelid_track := animation.add_track(Animation.TYPE_VALUE)
    animation.track_set_path(lower_eyelid_track, NodePath("Skeleton2D/LowerEyelidBone:rotation_degrees"))
    animation.track_insert_key(lower_eyelid_track, 0.0, lower_eyelid_rotation)

    animation_player.add_animation(name, animation)
