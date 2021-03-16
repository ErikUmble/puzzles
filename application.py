from flask import Flask, render_template, request, json, redirect, url_for

import sudoku


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
def get_solution():
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