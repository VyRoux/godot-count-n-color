extends Control

#
# NODE REFERENCES
#
@onready var color_boxes := [
	$ColorSpawner/ColorBox1,
	$ColorSpawner/ColorBox2,
	$ColorSpawner/ColorBox3,
	$ColorSpawner/ColorBox4,
	$ColorSpawner/ColorBox5
]

@onready var intructionText: RichTextLabel = $IntructionText
@onready var scoreText: Label = $ScoreText

@onready var answer_buttons := [
	$ButtonContainer/PickColor0,
	$ButtonContainer/PickColor1,
	$ButtonContainer/PickColor2
]


#
# DATA
#
var colors := {
	"Merah": Color.RED,
	"Hijau": Color.GREEN,
	"Kuning": Color.YELLOW,
	"Biru": Color.BLUE,
	"Ungu": Color.PURPLE,
	"Oren": Color.ORANGE,
	"Putih": Color.WHITE
}

var score: int = 0
var target_color: String
var correct_count: int


func _ready():
	for i in range(answer_buttons.size()):
		answer_buttons[i].pressed.connect(_on_answer_button.bind(i))

	scoreText.text = "0"
	start_round()


#
# ROUND
#
func start_round():
	var keys = colors.keys()

	# random isi warna
	for box in color_boxes:
		var pick = keys.pick_random()
		box.color = colors[pick]

	# pilih warna target
	target_color = keys.pick_random()

	# hitung jumlah warna target
	correct_count = 0
	for box in color_boxes:
		if box.color == colors[target_color]:
			correct_count += 1

	# set soal
	intructionText.text = "Berapa jumlah warna %s?" % target_color

	# setup opsi tombol
	_set_choices()


func _set_choices():
	# max jumlah 5 box
	var max_val = color_boxes.size()

	# list unik
	var choices = [correct_count]

	while choices.size() < 3:
		var r = randi_range(0, max_val)
		if r not in choices:
			choices.append(r)

	choices.shuffle()

	for i in range(3):
		answer_buttons[i].text = str(choices[i])
		answer_buttons[i].set_meta("value", choices[i])


#
# JAWABAN
#
func _on_answer_button(index: int):
	var picked = answer_buttons[index].get_meta("value")

	if picked == correct_count:
		score += 1
		set_good_feedback()
	else:
		score -= 1
		set_bad_feedback()

	scoreText.text = str(score)
	start_round()


#
# FEEDBACK
#
func set_good_feedback():
	print("Benar")

func set_bad_feedback():
	print("Salah")
