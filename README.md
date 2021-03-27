# Puzzles

Puzzles is a flask app that also contains AI Sudoku and Kenken solving services.

## Installation

Use the package manager [pip](https://pip.pypa.io/en/stable/) to install foobar.

```bash
pip install requirements.txt
```

## Usage
For the web app
```bash
flask run
```
For python AI
```python
import kenken
import sudoku

# Sudoku usage
my_sudoku = sudoku.Sudoku(generate=True, N=20)  # Generates a new Sudoku with 20 squares filled in
assignment, grid = my_sudoku.solve()  # Gets the solution in two forms: an assignment {"A1": "2", "A2":4, ...} and a grid [[2, 4, ...], [6, ...], ...]

grid = [
    ["0","0","0","0","0","0","0","0","0"],
    ["0","0","5","0","0","0","0","0","0"],
    ["0","0","0","0","0","0","3","0","0"],
    ["0","0","0","0","6","0","0","0","0"],
    ["0","0","0","0","0","0","0","0","0"],
    ["0","0","0","0","0","0","0","0","0"],
    ["0","0","1","0","0","0","0","0","0"],
    ["0","0","0","0","0","0","0","0","0"],
    ["0","0","0","0","0","0","2","0","0"]
]
my_sudoku = sudoku.Sudoku(grid=grid)  # Loads the grid into a Sudoku
assignment, grid = my_sudoku.solve()  # Gets the solution


# Kenken usage
my_kenken = kenken.Kenken(size=6, file="size6kenken.txt")  # Loads Kenken from "size6kenken.txt" (file must be in the format specified in neknek_format.txt)
assignment, grid = my_kenken.solve()  # Gets the solution in the same formats as with Sudoku

kenken.valid_combination(kenken.MULT, 60, [1, 4, 5, 3])  # returns True, as 1 * 4 * 5 * 3 = 60
kenken.possible_set(kenken.ADD, 6, 3, 9)  # returns {"1", "2", "3", "4"} which is a set of the possible values that squares could take on in a cage of addition to 6, with 3 square members, on a size 9 Kenken
```

## Description
This is the result of my CS50 final project. Here is a little about the journey to this code:
First, I started with making a sudoku AI that would then be able to generate new random sudokus. After maybe 5 different attempts at getting a backtracking with constraint satisfaction
and inference to work, I ended up going with the depth first search done by Peter Norvig (https://norvig.com/sudoku.html). I later took the same algorithm and extended it in
kenken.py to solve kenkens.
With the solving algorithm in place, I worked on setting up the flask application. This part was not too complicated, and only required adding a few routes
and data transfer methods to send puzzles to the html templates. I ended up using ideas from https://testdrive-archive.azurewebsites.net/Performance/Sudoku/Default.html
for setting up the javascript, but stuck with python for the AI, using an ajax call to load the solution while the user begins playing.
Puzzle generation is one of the main things this application is currently lacking; I cannot yet generate random kenkens (currently, kenkens are only "generated" from a collection
stored in kenken_grids/), and the sudoku generation is quite inefficient and does not produce reliable difficulty levels.
I plan to work on fixing these problems, as well as adding functionality for a user to load their own sudoku or kenken into the site and recieve the AI service help.