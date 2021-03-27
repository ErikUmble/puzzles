from flask import Flask, render_template, request, json, redirect, url_for

import sudoku
import kenken


app = Flask(__name__)

@app.route("/", methods=["GET"])
def index():
    return redirect("/sudoku")


@app.route("/sudoku", methods=["GET", "POST"])
def sudoku_page():
    if request.method == "GET":
        puzzle = sudoku.Sudoku(generate=True, difficulty="MEDIUM")
    else:
        # Coming from "New Sudoku" button
        difficulty = request.form.get("difficulty", "MEDIUM")
        puzzle = sudoku.Sudoku(generate=True, difficulty=difficulty)

    assignment = puzzle.domains
    return render_template("sudoku.html", assignment=assignment, squares=sudoku.convert_grid_12(sudoku.squares))

@app.route("/get_sudoku_solution", methods=["POST"])
def get_sudoku_solution():
    current_assignment = request.get_json()
    # remove pseudo assignments
    current_assignment = {
        square: value
        for square, value in current_assignment.items() if value != "0"
    }

    # load sudoku
    current_grid = sudoku.decode_assignment(current_assignment)
    current_sudoku = sudoku.Sudoku(grid=current_grid)

    # get solution
    solved_assignment, _ = current_sudoku.solve()
    return json.jsonify(solved_assignment)


@app.route("/kenken", methods=["POST", "GET"])
def kenken_page():
    if request.method == "GET":
        size=5
        puzzle = kenken.Kenken(size, file=f"kenken_grids/test_kenken{size}.txt")
    elif request.method == "POST":
        size = int(request.form.get("size", 6))
        ##Temp (since not all sizes are available yet)
        if size not in [2,3,4,5,6,7]:
            size = 6
        puzzle = kenken.generate_random_kenken(size)
    return render_template("kenken.html", squares=sudoku.convert_grid_12(puzzle.squares),
                                borders=puzzle.square_borders, size=size, cage_map=puzzle.cage_map, cage_restrictions=puzzle.cage_restrictions,
                                rev_op_map=kenken.Kenken.reverse_op_map)


@app.route("/get_kenken_solution", methods=["POST"])
def get_kenken_solution():
    data = request.get_json()

    # load kenken object
    k = kenken.Kenken(int(data["size"]))
    k.load_kenken(data["cage_map"], data["cage_restrictions"])

    # get solution
    solved_assignment, _ = k.solve()
    return json.jsonify(solved_assignment)