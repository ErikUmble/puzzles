var size = parseInt(str_size)
var rows = ["A", "B", "C", "D", "E", "F", "G", "H", "I"].slice(0, size);
var cols = ["1", "2", "3", "4", "5", "6", "7", "8", "9"].slice(0, size);
var Kenken_units = get_kenken_units(size)
ADD = 0
SUB = 1
MULT = 2
DIV = 3
EQ = 4

function check_consistent(assignment) {
    // assignment must be pseudo or complete (must contain mapping from each square to a value, and if unassigned, that value must be "0")
    // returns opject {"consistent": true/false, "error": ["A1","A2"]/.../null}
    // where error is the list of first square it detected an error on and the peer with same value, error is null if consistent

    // check rows and cols
    for (const square in assignment) {
        if (assignment[square] !== "0"){
            let units = Kenken_units[square];

            for (let i = 0; i < 2; i++) {
                let peer_unit = units[i];

                for (let j = 0; j < size; j++) {
                    let peer = peer_unit[j];

                    if ((peer !== square) && (assignment[peer] !== "0") && (assignment[peer] === assignment[square])) {
                        // found two assigned squares in the same unit that have the same value
                        return {"consistent": false, "error": [square, peer]};

                    }
                }
            }
        }

    }
    // check cages
    for (const cage in cage_restrictions) {
        let squares = cages[cage];

        // only check filled cages
        let filled = true;
        let these_values = [];
        for (let i=0; i < squares.length; i++) {  // might need to change this to do a for i= 0 to squares.length
            let square = squares[i];
            if (assignment[square] !== "0") {
                these_values.push(parseInt(assignment[square]));
            }
            else {
                filled = false;
                break;
            }
        }
        if (filled) {
            if (!valid_combination(cage_restrictions[cage][1], cage_restrictions[cage][0], these_values)) {
                return {"consistent": false, "error": squares};
            }
        }
    }
    return {"consistent": true, "error": null};
}

function valid_combination(op, result, values) {
    if (op === ADD) {
        return values.reduce((a,b) => a + b, 0) === result;
    }
    else if (op === SUB) {
        return Math.max(values[0], values[1]) - Math.min(values[0], values[1]) === result;  //// Does not handle cages of more than 2
    }
    else if (op === MULT) {
        return values.reduce((a, b) => a * b, 1) === result;
    }
    else if (op === DIV) {
        return Math.max(values[0], values[1]) / Math.min(values[0], values[1]) === result;  //// Does not handle cages of more than 2
    }
    else if (op === EQ) {
        return values[0] === result;
    }
}
// this is working but functionality of the others does not
function get_current_pseudo_assignment() {
    // returns object assignment of every square to the value it contains, thus assigning even squares that are not filled
    assignment = {};

    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            let id = rows[i] + cols[j];
            let square = document.getElementById(id).children[0];
            let value = "0";

            if (square.tagName == "INPUT") {
                value = square.value;
            }
            else if (square.tagName == "SPAN") {
                value = square.textContent;
            }
            // Check validity of input
            if (!value.match(/^[1-9]$/)) {
                value = "0";
            }
            assignment[rows[i] + cols[j]] = value;

        }
    }
    return assignment;
}

function assignment_complete(assignment) {
    // assignment must be pseudo or complete (every square must be assigned a value, and "0" assigned to unassigned squares)
    for (const square in assignment) {
        if (assignment[square] === "0") {
            // there is an unfilled square
            return false;
        }
    }
    return true;
}

function render_updates(updates){
    // Temporarily changes the class of each square in update to include "update"
    for (let i = 0; i < updates.length; i++) {
        let changed_square = updates[i];
        // save previous class info
        let square = document.getElementById(changed_square);
        let original = square.getAttribute("class");

        square.setAttribute("class", original + " update");
        setTimeout(function() {
            square.setAttribute("class", original);
        }, 2000);
    }
}

function render_assignment(assignment, previous_assignment=get_current_pseudo_assignment(), overwrite_with_blanks=false, overwrite_initial_squares=true) {
    // an assignment with every square assigned to "0" will completely clear the grid if overwrite_with_blanks == true && overwrite_initial_squares == true
    // any non zero assigned value will overwrite its square no matter what
    // "0" in assignment can leave the corresponding squares as they are if overwrite_with_blanks == false
    // by default, the initially filled in squares, with html span tags, will not be changed unless overwrite_initial_squares == true
    let updates = [];
    for (const square in assignment) {


        // see if we will be overwriting
        if (assignment[square] !== "0" || overwrite_with_blanks) {
            let s = document.getElementById(square).children[0];

            if (s.tagName == "INPUT") {
                if (s.value !== assignment[square]) {
                    s.value = assignment[square];
                    updates.push(square);
                }

            }
            else if (s.tagName == "SPAN" && overwrite_initial_squares) {
                // overwrite initially filled in squares
                s.textContent = assignment[square];
            }
        }
    }
    render_updates(updates);
}

function render_errors(errors) {
    // Temporarily changes the class of each square in errors to include "error"
    for (let i = 0; i < errors.length; i++) {
        let error = errors[i];
        // save previous class info
        let square = document.getElementById(error);
        let original = square.getAttribute("class");

        square.setAttribute("class", original + " error");
        setTimeout(function() {
            square.setAttribute("class", original);
        }, 5000);
    }

}

function get_hint_placeholders() {
    // returns a list of the input ids that have the current value of ?
    rows = new Array("A", "B", "C", "D", "E", "F", "G", "H", "I");
    cols = new Array("1", "2", "3", "4", "5", "6", "7", "8", "9");
    hints = [];

    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            let id = rows[i] + cols[j];
            let square = document.getElementById(id).children[0];

            if (square.tagName == "INPUT") {
                if (square.value === "?") {
                    hints.push(rows[i] + cols[j]);
                }
            }


        }
    }
    return hints;
}

function get_kenken_units(size) {
    // TEMP: get kenken_units ... this way might not be best in the long-run
    if (size === 3) {
        return {'A1': [['A1', 'B1', 'C1'], ['A1', 'A2', 'A3']], 'A2': [['A2', 'B2', 'C2'], ['A1', 'A2', 'A3']], 'A3': [['A3', 'B3', 'C3'], ['A1', 'A2', 'A3']], 'B1': [['A1', 'B1', 'C1'], ['B1', 'B2', 'B3']], 'B2': [['A2', 'B2', 'C2'], ['B1', 'B2', 'B3']], 'B3': [['A3', 'B3', 'C3'], ['B1', 'B2', 'B3']], 'C1': [['A1', 'B1', 'C1'], ['C1', 'C2', 'C3']], 'C2': [['A2', 'B2', 'C2'], ['C1', 'C2', 'C3']], 'C3': [['A3', 'B3', 'C3'], ['C1', 'C2', 'C3']]};
    }
    else if (size == 4) {
        return {'A1': [['A1', 'B1', 'C1', 'D1'], ['A1', 'A2', 'A3', 'A4']], 'A2': [['A2', 'B2', 'C2', 'D2'], ['A1', 'A2', 'A3', 'A4']], 'A3': [['A3', 'B3', 'C3', 'D3'], ['A1', 'A2', 'A3', 'A4']], 'A4': [['A4', 'B4', 'C4', 'D4'], ['A1', 'A2', 'A3', 'A4']], 'B1': [['A1', 'B1', 'C1', 'D1'], ['B1', 'B2', 'B3', 'B4']], 'B2': [['A2', 'B2', 'C2', 'D2'], ['B1', 'B2', 'B3', 'B4']], 'B3': [['A3', 'B3', 'C3', 'D3'], ['B1', 'B2', 'B3', 'B4']], 'B4': [['A4', 'B4', 'C4', 'D4'], ['B1', 'B2', 'B3', 'B4']], 'C1': [['A1', 'B1', 'C1', 'D1'], ['C1', 'C2', 'C3', 'C4']], 'C2': [['A2', 'B2', 'C2', 'D2'], ['C1', 'C2', 'C3', 'C4']], 'C3': [['A3', 'B3', 'C3', 'D3'], ['C1', 'C2', 'C3', 'C4']], 'C4': [['A4', 'B4', 'C4', 'D4'], ['C1', 'C2', 'C3', 'C4']], 'D1': [['A1', 'B1', 'C1', 'D1'], ['D1', 'D2', 'D3', 'D4']], 'D2': [['A2', 'B2', 'C2', 'D2'], ['D1', 'D2', 'D3', 'D4']], 'D3': [['A3', 'B3', 'C3', 'D3'], ['D1', 'D2', 'D3', 'D4']], 'D4': [['A4', 'B4', 'C4', 'D4'], ['D1', 'D2', 'D3', 'D4']]};
    }
    else if (size == 5) {
        return {'A1': [['A1', 'B1', 'C1', 'D1', 'E1'], ['A1', 'A2', 'A3', 'A4', 'A5']], 'A2': [['A2', 'B2', 'C2', 'D2', 'E2'], ['A1', 'A2', 'A3', 'A4', 'A5']], 'A3': [['A3', 'B3', 'C3', 'D3', 'E3'], ['A1', 'A2', 'A3', 'A4', 'A5']], 'A4': [['A4', 'B4', 'C4', 'D4', 'E4'], ['A1', 'A2', 'A3', 'A4', 'A5']], 'A5': [['A5', 'B5', 'C5', 'D5', 'E5'], ['A1', 'A2', 'A3', 'A4', 'A5']], 'B1': [['A1', 'B1', 'C1', 'D1', 'E1'], ['B1', 'B2', 'B3', 'B4', 'B5']], 'B2': [['A2', 'B2', 'C2', 'D2', 'E2'], ['B1', 'B2', 'B3', 'B4', 'B5']], 'B3': [['A3', 'B3', 'C3', 'D3', 'E3'], ['B1', 'B2', 'B3', 'B4', 'B5']], 'B4': [['A4', 'B4', 'C4', 'D4', 'E4'], ['B1', 'B2', 'B3', 'B4', 'B5']], 'B5': [['A5', 'B5', 'C5', 'D5', 'E5'], ['B1', 'B2', 'B3', 'B4', 'B5']], 'C1': [['A1', 'B1', 'C1', 'D1', 'E1'], ['C1', 'C2', 'C3', 'C4', 'C5']], 'C2': [['A2', 'B2', 'C2', 'D2', 'E2'], ['C1', 'C2', 'C3', 'C4', 'C5']], 'C3': [['A3', 'B3', 'C3', 'D3', 'E3'], ['C1', 'C2', 'C3', 'C4', 'C5']], 'C4': [['A4', 'B4', 'C4', 'D4', 'E4'], ['C1', 'C2', 'C3', 'C4', 'C5']], 'C5': [['A5', 'B5', 'C5', 'D5', 'E5'], ['C1', 'C2', 'C3', 'C4', 'C5']], 'D1': [['A1', 'B1', 'C1', 'D1', 'E1'], ['D1', 'D2', 'D3', 'D4', 'D5']], 'D2': [['A2', 'B2', 'C2', 'D2', 'E2'], ['D1', 'D2', 'D3', 'D4', 'D5']], 'D3': [['A3', 'B3', 'C3', 'D3', 'E3'], ['D1', 'D2', 'D3', 'D4', 'D5']], 'D4': [['A4', 'B4', 'C4', 'D4', 'E4'], ['D1', 'D2', 'D3', 'D4', 'D5']], 'D5': [['A5', 'B5', 'C5', 'D5', 'E5'], ['D1', 'D2', 'D3', 'D4', 'D5']], 'E1': [['A1', 'B1', 'C1', 'D1', 'E1'], ['E1', 'E2', 'E3', 'E4', 'E5']], 'E2': [['A2', 'B2', 'C2', 'D2', 'E2'], ['E1', 'E2', 'E3', 'E4', 'E5']], 'E3': [['A3', 'B3', 'C3', 'D3', 'E3'], ['E1', 'E2', 'E3', 'E4', 'E5']], 'E4': [['A4', 'B4', 'C4', 'D4', 'E4'], ['E1', 'E2', 'E3', 'E4', 'E5']], 'E5': [['A5', 'B5', 'C5', 'D5', 'E5'], ['E1', 'E2', 'E3', 'E4', 'E5']]};
    }
    else if (size == 6) {
        return {'A1': [['A1', 'B1', 'C1', 'D1', 'E1', 'F1'], ['A1', 'A2', 'A3', 'A4', 'A5', 'A6']], 'A2': [['A2', 'B2', 'C2', 'D2', 'E2', 'F2'], ['A1', 'A2', 'A3', 'A4', 'A5', 'A6']], 'A3': [['A3', 'B3', 'C3', 'D3', 'E3', 'F3'], ['A1', 'A2', 'A3', 'A4', 'A5', 'A6']], 'A4': [['A4', 'B4', 'C4', 'D4', 'E4', 'F4'], ['A1', 'A2', 'A3', 'A4', 'A5', 'A6']], 'A5': [['A5', 'B5', 'C5', 'D5', 'E5', 'F5'], ['A1', 'A2', 'A3', 'A4', 'A5', 'A6']], 'A6': [['A6', 'B6', 'C6', 'D6', 'E6', 'F6'], ['A1', 'A2', 'A3', 'A4', 'A5', 'A6']], 'B1': [['A1', 'B1', 'C1', 'D1', 'E1', 'F1'], ['B1', 'B2', 'B3', 'B4', 'B5', 'B6']], 'B2': [['A2', 'B2', 'C2', 'D2', 'E2', 'F2'], ['B1', 'B2', 'B3', 'B4', 'B5', 'B6']], 'B3': [['A3', 'B3', 'C3', 'D3', 'E3', 'F3'], ['B1', 'B2', 'B3', 'B4', 'B5', 'B6']], 'B4': [['A4', 'B4', 'C4', 'D4', 'E4', 'F4'], ['B1', 'B2', 'B3', 'B4', 'B5', 'B6']], 'B5': [['A5', 'B5', 'C5', 'D5', 'E5', 'F5'], ['B1', 'B2', 'B3', 'B4', 'B5', 'B6']], 'B6': [['A6', 'B6', 'C6', 'D6', 'E6', 'F6'], ['B1', 'B2', 'B3', 'B4', 'B5', 'B6']], 'C1': [['A1', 'B1', 'C1', 'D1', 'E1', 'F1'], ['C1', 'C2', 'C3', 'C4', 'C5', 'C6']], 'C2': [['A2', 'B2', 'C2', 'D2', 'E2', 'F2'], ['C1', 'C2', 'C3', 'C4', 'C5', 'C6']], 'C3': [['A3', 'B3', 'C3', 'D3', 'E3', 'F3'], ['C1', 'C2', 'C3', 'C4', 'C5', 'C6']], 'C4': [['A4', 'B4', 'C4', 'D4', 'E4', 'F4'], ['C1', 'C2', 'C3', 'C4', 'C5', 'C6']], 'C5': [['A5', 'B5', 'C5', 'D5', 'E5', 'F5'], ['C1', 'C2', 'C3', 'C4', 'C5', 'C6']], 'C6': [['A6', 'B6', 'C6', 'D6', 'E6', 'F6'], ['C1', 'C2', 'C3', 'C4', 'C5', 'C6']], 'D1': [['A1', 'B1', 'C1', 'D1', 'E1', 'F1'], ['D1', 'D2', 'D3', 'D4', 'D5', 'D6']], 'D2': [['A2', 'B2', 'C2', 'D2', 'E2', 'F2'], ['D1', 'D2', 'D3', 'D4', 'D5', 'D6']], 'D3': [['A3', 'B3', 'C3', 'D3', 'E3', 'F3'], ['D1', 'D2', 'D3', 'D4', 'D5', 'D6']], 'D4': [['A4', 'B4', 'C4', 'D4', 'E4', 'F4'], ['D1', 'D2', 'D3', 'D4', 'D5', 'D6']], 'D5': [['A5', 'B5', 'C5', 'D5', 'E5', 'F5'], ['D1', 'D2', 'D3', 'D4', 'D5', 'D6']], 'D6': [['A6', 'B6', 'C6', 'D6', 'E6', 'F6'], ['D1', 'D2', 'D3', 'D4', 'D5', 'D6']], 'E1': [['A1', 'B1', 'C1', 'D1', 'E1', 'F1'], ['E1', 'E2', 'E3', 'E4', 'E5', 'E6']], 'E2': [['A2', 'B2', 'C2', 'D2', 'E2', 'F2'], ['E1', 'E2', 'E3', 'E4', 'E5', 'E6']], 'E3': [['A3', 'B3', 'C3', 'D3', 'E3', 'F3'], ['E1', 'E2', 'E3', 'E4', 'E5', 'E6']], 'E4': [['A4', 'B4', 'C4', 'D4', 'E4', 'F4'], ['E1', 'E2', 'E3', 'E4', 'E5', 'E6']], 'E5': [['A5', 'B5', 'C5', 'D5', 'E5', 'F5'], ['E1', 'E2', 'E3', 'E4', 'E5', 'E6']], 'E6': [['A6', 'B6', 'C6', 'D6', 'E6', 'F6'], ['E1', 'E2', 'E3', 'E4', 'E5', 'E6']], 'F1': [['A1', 'B1', 'C1', 'D1', 'E1', 'F1'], ['F1', 'F2', 'F3', 'F4', 'F5', 'F6']], 'F2': [['A2', 'B2', 'C2', 'D2', 'E2', 'F2'], ['F1', 'F2', 'F3', 'F4', 'F5', 'F6']], 'F3': [['A3', 'B3', 'C3', 'D3', 'E3', 'F3'], ['F1', 'F2', 'F3', 'F4', 'F5', 'F6']], 'F4': [['A4', 'B4', 'C4', 'D4', 'E4', 'F4'], ['F1', 'F2', 'F3', 'F4', 'F5', 'F6']], 'F5': [['A5', 'B5', 'C5', 'D5', 'E5', 'F5'], ['F1', 'F2', 'F3', 'F4', 'F5', 'F6']], 'F6': [['A6', 'B6', 'C6', 'D6', 'E6', 'F6'], ['F1', 'F2', 'F3', 'F4', 'F5', 'F6']]};
    }
    else if (size == 7) {
        return {'A1': [['A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1'], ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7']], 'A2': [['A2', 'B2', 'C2', 'D2', 'E2', 'F2', 'G2'], ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7']], 'A3': [['A3', 'B3', 'C3', 'D3', 'E3', 'F3', 'G3'], ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7']], 'A4': [['A4', 'B4', 'C4', 'D4', 'E4', 'F4', 'G4'], ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7']], 'A5': [['A5', 'B5', 'C5', 'D5', 'E5', 'F5', 'G5'], ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7']], 'A6': [['A6', 'B6', 'C6', 'D6', 'E6', 'F6', 'G6'], ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7']], 'A7': [['A7', 'B7', 'C7', 'D7', 'E7', 'F7', 'G7'], ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7']], 'B1': [['A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1'], ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7']], 'B2': [['A2', 'B2', 'C2', 'D2', 'E2', 'F2', 'G2'], ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7']], 'B3': [['A3', 'B3', 'C3', 'D3', 'E3', 'F3', 'G3'], ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7']], 'B4': [['A4', 'B4', 'C4', 'D4', 'E4', 'F4', 'G4'], ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7']], 'B5': [['A5', 'B5', 'C5', 'D5', 'E5', 'F5', 'G5'], ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7']], 'B6': [['A6', 'B6', 'C6', 'D6', 'E6', 'F6', 'G6'], ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7']], 'B7': [['A7', 'B7', 'C7', 'D7', 'E7', 'F7', 'G7'], ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7']], 'C1': [['A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1'], ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7']], 'C2': [['A2', 'B2', 'C2', 'D2', 'E2', 'F2', 'G2'], ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7']], 'C3': [['A3', 'B3', 'C3', 'D3', 'E3', 'F3', 'G3'], ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7']], 'C4': [['A4', 'B4', 'C4', 'D4', 'E4', 'F4', 'G4'], ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7']], 'C5': [['A5', 'B5', 'C5', 'D5', 'E5', 'F5', 'G5'], ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7']], 'C6': [['A6', 'B6', 'C6', 'D6', 'E6', 'F6', 'G6'], ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7']], 'C7': [['A7', 'B7', 'C7', 'D7', 'E7', 'F7', 'G7'], ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7']], 'D1': [['A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1'], ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7']], 'D2': [['A2', 'B2', 'C2', 'D2', 'E2', 'F2', 'G2'], ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7']], 'D3': [['A3', 'B3', 'C3', 'D3', 'E3', 'F3', 'G3'], ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7']], 'D4': [['A4', 'B4', 'C4', 'D4', 'E4', 'F4', 'G4'], ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7']], 'D5': [['A5', 'B5', 'C5', 'D5', 'E5', 'F5', 'G5'], ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7']], 'D6': [['A6', 'B6', 'C6', 'D6', 'E6', 'F6', 'G6'], ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7']], 'D7': [['A7', 'B7', 'C7', 'D7', 'E7', 'F7', 'G7'], ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7']], 'E1': [['A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1'], ['E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7']], 'E2': [['A2', 'B2', 'C2', 'D2', 'E2', 'F2', 'G2'], ['E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7']], 'E3': [['A3', 'B3', 'C3', 'D3', 'E3', 'F3', 'G3'], ['E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7']], 'E4': [['A4', 'B4', 'C4', 'D4', 'E4', 'F4', 'G4'], ['E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7']], 'E5': [['A5', 'B5', 'C5', 'D5', 'E5', 'F5', 'G5'], ['E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7']], 'E6': [['A6', 'B6', 'C6', 'D6', 'E6', 'F6', 'G6'], ['E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7']], 'E7': [['A7', 'B7', 'C7', 'D7', 'E7', 'F7', 'G7'], ['E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7']], 'F1': [['A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1'], ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7']], 'F2': [['A2', 'B2', 'C2', 'D2', 'E2', 'F2', 'G2'], ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7']], 'F3': [['A3', 'B3', 'C3', 'D3', 'E3', 'F3', 'G3'], ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7']], 'F4': [['A4', 'B4', 'C4', 'D4', 'E4', 'F4', 'G4'], ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7']], 'F5': [['A5', 'B5', 'C5', 'D5', 'E5', 'F5', 'G5'], ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7']], 'F6': [['A6', 'B6', 'C6', 'D6', 'E6', 'F6', 'G6'], ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7']], 'F7': [['A7', 'B7', 'C7', 'D7', 'E7', 'F7', 'G7'], ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7']], 'G1': [['A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1'], ['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7']], 'G2': [['A2', 'B2', 'C2', 'D2', 'E2', 'F2', 'G2'], ['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7']], 'G3': [['A3', 'B3', 'C3', 'D3', 'E3', 'F3', 'G3'], ['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7']], 'G4': [['A4', 'B4', 'C4', 'D4', 'E4', 'F4', 'G4'], ['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7']], 'G5': [['A5', 'B5', 'C5', 'D5', 'E5', 'F5', 'G5'], ['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7']], 'G6': [['A6', 'B6', 'C6', 'D6', 'E6', 'F6', 'G6'], ['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7']], 'G7': [['A7', 'B7', 'C7', 'D7', 'E7', 'F7', 'G7'], ['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7']]};
    }
    else if (size == 8) {
        return {'A1': [['A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1', 'H1'], ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8']], 'A2': [['A2', 'B2', 'C2', 'D2', 'E2', 'F2', 'G2', 'H2'], ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8']], 'A3': [['A3', 'B3', 'C3', 'D3', 'E3', 'F3', 'G3', 'H3'], ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8']], 'A4': [['A4', 'B4', 'C4', 'D4', 'E4', 'F4', 'G4', 'H4'], ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8']], 'A5': [['A5', 'B5', 'C5', 'D5', 'E5', 'F5', 'G5', 'H5'], ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8']], 'A6': [['A6', 'B6', 'C6', 'D6', 'E6', 'F6', 'G6', 'H6'], ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8']], 'A7': [['A7', 'B7', 'C7', 'D7', 'E7', 'F7', 'G7', 'H7'], ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8']], 'A8': [['A8', 'B8', 'C8', 'D8', 'E8', 'F8', 'G8', 'H8'], ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8']], 'B1': [['A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1', 'H1'], ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8']], 'B2': [['A2', 'B2', 'C2', 'D2', 'E2', 'F2', 'G2', 'H2'], ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8']], 'B3': [['A3', 'B3', 'C3', 'D3', 'E3', 'F3', 'G3', 'H3'], ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8']], 'B4': [['A4', 'B4', 'C4', 'D4', 'E4', 'F4', 'G4', 'H4'], ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8']], 'B5': [['A5', 'B5', 'C5', 'D5', 'E5', 'F5', 'G5', 'H5'], ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8']], 'B6': [['A6', 'B6', 'C6', 'D6', 'E6', 'F6', 'G6', 'H6'], ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8']], 'B7': [['A7', 'B7', 'C7', 'D7', 'E7', 'F7', 'G7', 'H7'], ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8']], 'B8': [['A8', 'B8', 'C8', 'D8', 'E8', 'F8', 'G8', 'H8'], ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8']], 'C1': [['A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1', 'H1'], ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8']], 'C2': [['A2', 'B2', 'C2', 'D2', 'E2', 'F2', 'G2', 'H2'], ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8']], 'C3': [['A3', 'B3', 'C3', 'D3', 'E3', 'F3', 'G3', 'H3'], ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8']], 'C4': [['A4', 'B4', 'C4', 'D4', 'E4', 'F4', 'G4', 'H4'], ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8']], 'C5': [['A5', 'B5', 'C5', 'D5', 'E5', 'F5', 'G5', 'H5'], ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8']], 'C6': [['A6', 'B6', 'C6', 'D6', 'E6', 'F6', 'G6', 'H6'], ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8']], 'C7': [['A7', 'B7', 'C7', 'D7', 'E7', 'F7', 'G7', 'H7'], ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8']], 'C8': [['A8', 'B8', 'C8', 'D8', 'E8', 'F8', 'G8', 'H8'], ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8']], 'D1': [['A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1', 'H1'], ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8']], 'D2': [['A2', 'B2', 'C2', 'D2', 'E2', 'F2', 'G2', 'H2'], ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8']], 'D3': [['A3', 'B3', 'C3', 'D3', 'E3', 'F3', 'G3', 'H3'], ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8']], 'D4': [['A4', 'B4', 'C4', 'D4', 'E4', 'F4', 'G4', 'H4'], ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8']], 'D5': [['A5', 'B5', 'C5', 'D5', 'E5', 'F5', 'G5', 'H5'], ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8']], 'D6': [['A6', 'B6', 'C6', 'D6', 'E6', 'F6', 'G6', 'H6'], ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8']], 'D7': [['A7', 'B7', 'C7', 'D7', 'E7', 'F7', 'G7', 'H7'], ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8']], 'D8': [['A8', 'B8', 'C8', 'D8', 'E8', 'F8', 'G8', 'H8'], ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8']], 'E1': [['A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1', 'H1'], ['E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8']], 'E2': [['A2', 'B2', 'C2', 'D2', 'E2', 'F2', 'G2', 'H2'], ['E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8']], 'E3': [['A3', 'B3', 'C3', 'D3', 'E3', 'F3', 'G3', 'H3'], ['E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8']], 'E4': [['A4', 'B4', 'C4', 'D4', 'E4', 'F4', 'G4', 'H4'], ['E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8']], 'E5': [['A5', 'B5', 'C5', 'D5', 'E5', 'F5', 'G5', 'H5'], ['E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8']], 'E6': [['A6', 'B6', 'C6', 'D6', 'E6', 'F6', 'G6', 'H6'], ['E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8']], 'E7': [['A7', 'B7', 'C7', 'D7', 'E7', 'F7', 'G7', 'H7'], ['E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8']], 'E8': [['A8', 'B8', 'C8', 'D8', 'E8', 'F8', 'G8', 'H8'], ['E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8']], 'F1': [['A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1', 'H1'], ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8']], 'F2': [['A2', 'B2', 'C2', 'D2', 'E2', 'F2', 'G2', 'H2'], ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8']], 'F3': [['A3', 'B3', 'C3', 'D3', 'E3', 'F3', 'G3', 'H3'], ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8']], 'F4': [['A4', 'B4', 'C4', 'D4', 'E4', 'F4', 'G4', 'H4'], ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8']], 'F5': [['A5', 'B5', 'C5', 'D5', 'E5', 'F5', 'G5', 'H5'], ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8']], 'F6': [['A6', 'B6', 'C6', 'D6', 'E6', 'F6', 'G6', 'H6'], ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8']], 'F7': [['A7', 'B7', 'C7', 'D7', 'E7', 'F7', 'G7', 'H7'], ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8']], 'F8': [['A8', 'B8', 'C8', 'D8', 'E8', 'F8', 'G8', 'H8'], ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8']], 'G1': [['A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1', 'H1'], ['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8']], 'G2': [['A2', 'B2', 'C2', 'D2', 'E2', 'F2', 'G2', 'H2'], ['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8']], 'G3': [['A3', 'B3', 'C3', 'D3', 'E3', 'F3', 'G3', 'H3'], ['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8']], 'G4': [['A4', 'B4', 'C4', 'D4', 'E4', 'F4', 'G4', 'H4'], ['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8']], 'G5': [['A5', 'B5', 'C5', 'D5', 'E5', 'F5', 'G5', 'H5'], ['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8']], 'G6': [['A6', 'B6', 'C6', 'D6', 'E6', 'F6', 'G6', 'H6'], ['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8']], 'G7': [['A7', 'B7', 'C7', 'D7', 'E7', 'F7', 'G7', 'H7'], ['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8']], 'G8': [['A8', 'B8', 'C8', 'D8', 'E8', 'F8', 'G8', 'H8'], ['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8']], 'H1': [['A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1', 'H1'], ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'H7', 'H8']], 'H2': [['A2', 'B2', 'C2', 'D2', 'E2', 'F2', 'G2', 'H2'], ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'H7', 'H8']], 'H3': [['A3', 'B3', 'C3', 'D3', 'E3', 'F3', 'G3', 'H3'], ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'H7', 'H8']], 'H4': [['A4', 'B4', 'C4', 'D4', 'E4', 'F4', 'G4', 'H4'], ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'H7', 'H8']], 'H5': [['A5', 'B5', 'C5', 'D5', 'E5', 'F5', 'G5', 'H5'], ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'H7', 'H8']], 'H6': [['A6', 'B6', 'C6', 'D6', 'E6', 'F6', 'G6', 'H6'], ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'H7', 'H8']], 'H7': [['A7', 'B7', 'C7', 'D7', 'E7', 'F7', 'G7', 'H7'], ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'H7', 'H8']], 'H8': [['A8', 'B8', 'C8', 'D8', 'E8', 'F8', 'G8', 'H8'], ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'H7', 'H8']]};
    }
    else if (size == 9) {
        return {'A1': [['A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1', 'H1', 'I1'], ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9']], 'A2': [['A2', 'B2', 'C2', 'D2', 'E2', 'F2', 'G2', 'H2', 'I2'], ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9']], 'A3': [['A3', 'B3', 'C3', 'D3', 'E3', 'F3', 'G3', 'H3', 'I3'], ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9']], 'A4': [['A4', 'B4', 'C4', 'D4', 'E4', 'F4', 'G4', 'H4', 'I4'], ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9']], 'A5': [['A5', 'B5', 'C5', 'D5', 'E5', 'F5', 'G5', 'H5', 'I5'], ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9']], 'A6': [['A6', 'B6', 'C6', 'D6', 'E6', 'F6', 'G6', 'H6', 'I6'], ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9']], 'A7': [['A7', 'B7', 'C7', 'D7', 'E7', 'F7', 'G7', 'H7', 'I7'], ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9']], 'A8': [['A8', 'B8', 'C8', 'D8', 'E8', 'F8', 'G8', 'H8', 'I8'], ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9']], 'A9': [['A9', 'B9', 'C9', 'D9', 'E9', 'F9', 'G9', 'H9', 'I9'], ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9']], 'B1': [['A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1', 'H1', 'I1'], ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B9']], 'B2': [['A2', 'B2', 'C2', 'D2', 'E2', 'F2', 'G2', 'H2', 'I2'], ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B9']], 'B3': [['A3', 'B3', 'C3', 'D3', 'E3', 'F3', 'G3', 'H3', 'I3'], ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B9']], 'B4': [['A4', 'B4', 'C4', 'D4', 'E4', 'F4', 'G4', 'H4', 'I4'], ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B9']], 'B5': [['A5', 'B5', 'C5', 'D5', 'E5', 'F5', 'G5', 'H5', 'I5'], ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B9']], 'B6': [['A6', 'B6', 'C6', 'D6', 'E6', 'F6', 'G6', 'H6', 'I6'], ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B9']], 'B7': [['A7', 'B7', 'C7', 'D7', 'E7', 'F7', 'G7', 'H7', 'I7'], ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B9']], 'B8': [['A8', 'B8', 'C8', 'D8', 'E8', 'F8', 'G8', 'H8', 'I8'], ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B9']], 'B9': [['A9', 'B9', 'C9', 'D9', 'E9', 'F9', 'G9', 'H9', 'I9'], ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B9']], 'C1': [['A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1', 'H1', 'I1'], ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9']], 'C2': [['A2', 'B2', 'C2', 'D2', 'E2', 'F2', 'G2', 'H2', 'I2'], ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9']], 'C3': [['A3', 'B3', 'C3', 'D3', 'E3', 'F3', 'G3', 'H3', 'I3'], ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9']], 'C4': [['A4', 'B4', 'C4', 'D4', 'E4', 'F4', 'G4', 'H4', 'I4'], ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9']], 'C5': [['A5', 'B5', 'C5', 'D5', 'E5', 'F5', 'G5', 'H5', 'I5'], ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9']], 'C6': [['A6', 'B6', 'C6', 'D6', 'E6', 'F6', 'G6', 'H6', 'I6'], ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9']], 'C7': [['A7', 'B7', 'C7', 'D7', 'E7', 'F7', 'G7', 'H7', 'I7'], ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9']], 'C8': [['A8', 'B8', 'C8', 'D8', 'E8', 'F8', 'G8', 'H8', 'I8'], ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9']], 'C9': [['A9', 'B9', 'C9', 'D9', 'E9', 'F9', 'G9', 'H9', 'I9'], ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9']], 'D1': [['A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1', 'H1', 'I1'], ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9']], 'D2': [['A2', 'B2', 'C2', 'D2', 'E2', 'F2', 'G2', 'H2', 'I2'], ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9']], 'D3': [['A3', 'B3', 'C3', 'D3', 'E3', 'F3', 'G3', 'H3', 'I3'], ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9']], 'D4': [['A4', 'B4', 'C4', 'D4', 'E4', 'F4', 'G4', 'H4', 'I4'], ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9']], 'D5': [['A5', 'B5', 'C5', 'D5', 'E5', 'F5', 'G5', 'H5', 'I5'], ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9']], 'D6': [['A6', 'B6', 'C6', 'D6', 'E6', 'F6', 'G6', 'H6', 'I6'], ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9']], 'D7': [['A7', 'B7', 'C7', 'D7', 'E7', 'F7', 'G7', 'H7', 'I7'], ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9']], 'D8': [['A8', 'B8', 'C8', 'D8', 'E8', 'F8', 'G8', 'H8', 'I8'], ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9']], 'D9': [['A9', 'B9', 'C9', 'D9', 'E9', 'F9', 'G9', 'H9', 'I9'], ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9']], 'E1': [['A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1', 'H1', 'I1'], ['E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8', 'E9']], 'E2': [['A2', 'B2', 'C2', 'D2', 'E2', 'F2', 'G2', 'H2', 'I2'], ['E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8', 'E9']], 'E3': [['A3', 'B3', 'C3', 'D3', 'E3', 'F3', 'G3', 'H3', 'I3'], ['E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8', 'E9']], 'E4': [['A4', 'B4', 'C4', 'D4', 'E4', 'F4', 'G4', 'H4', 'I4'], ['E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8', 'E9']], 'E5': [['A5', 'B5', 'C5', 'D5', 'E5', 'F5', 'G5', 'H5', 'I5'], ['E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8', 'E9']], 'E6': [['A6', 'B6', 'C6', 'D6', 'E6', 'F6', 'G6', 'H6', 'I6'], ['E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8', 'E9']], 'E7': [['A7', 'B7', 'C7', 'D7', 'E7', 'F7', 'G7', 'H7', 'I7'], ['E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8', 'E9']], 'E8': [['A8', 'B8', 'C8', 'D8', 'E8', 'F8', 'G8', 'H8', 'I8'], ['E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8', 'E9']], 'E9': [['A9', 'B9', 'C9', 'D9', 'E9', 'F9', 'G9', 'H9', 'I9'], ['E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8', 'E9']], 'F1': [['A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1', 'H1', 'I1'], ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9']], 'F2': [['A2', 'B2', 'C2', 'D2', 'E2', 'F2', 'G2', 'H2', 'I2'], ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9']], 'F3': [['A3', 'B3', 'C3', 'D3', 'E3', 'F3', 'G3', 'H3', 'I3'], ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9']], 'F4': [['A4', 'B4', 'C4', 'D4', 'E4', 'F4', 'G4', 'H4', 'I4'], ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9']], 'F5': [['A5', 'B5', 'C5', 'D5', 'E5', 'F5', 'G5', 'H5', 'I5'], ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9']], 'F6': [['A6', 'B6', 'C6', 'D6', 'E6', 'F6', 'G6', 'H6', 'I6'], ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9']], 'F7': [['A7', 'B7', 'C7', 'D7', 'E7', 'F7', 'G7', 'H7', 'I7'], ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9']], 'F8': [['A8', 'B8', 'C8', 'D8', 'E8', 'F8', 'G8', 'H8', 'I8'], ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9']], 'F9': [['A9', 'B9', 'C9', 'D9', 'E9', 'F9', 'G9', 'H9', 'I9'], ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9']], 'G1': [['A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1', 'H1', 'I1'], ['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8', 'G9']], 'G2': [['A2', 'B2', 'C2', 'D2', 'E2', 'F2', 'G2', 'H2', 'I2'], ['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8', 'G9']], 'G3': [['A3', 'B3', 'C3', 'D3', 'E3', 'F3', 'G3', 'H3', 'I3'], ['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8', 'G9']], 'G4': [['A4', 'B4', 'C4', 'D4', 'E4', 'F4', 'G4', 'H4', 'I4'], ['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8', 'G9']], 'G5': [['A5', 'B5', 'C5', 'D5', 'E5', 'F5', 'G5', 'H5', 'I5'], ['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8', 'G9']], 'G6': [['A6', 'B6', 'C6', 'D6', 'E6', 'F6', 'G6', 'H6', 'I6'], ['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8', 'G9']], 'G7': [['A7', 'B7', 'C7', 'D7', 'E7', 'F7', 'G7', 'H7', 'I7'], ['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8', 'G9']], 'G8': [['A8', 'B8', 'C8', 'D8', 'E8', 'F8', 'G8', 'H8', 'I8'], ['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8', 'G9']], 'G9': [['A9', 'B9', 'C9', 'D9', 'E9', 'F9', 'G9', 'H9', 'I9'], ['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8', 'G9']], 'H1': [['A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1', 'H1', 'I1'], ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'H7', 'H8', 'H9']], 'H2': [['A2', 'B2', 'C2', 'D2', 'E2', 'F2', 'G2', 'H2', 'I2'], ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'H7', 'H8', 'H9']], 'H3': [['A3', 'B3', 'C3', 'D3', 'E3', 'F3', 'G3', 'H3', 'I3'], ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'H7', 'H8', 'H9']], 'H4': [['A4', 'B4', 'C4', 'D4', 'E4', 'F4', 'G4', 'H4', 'I4'], ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'H7', 'H8', 'H9']], 'H5': [['A5', 'B5', 'C5', 'D5', 'E5', 'F5', 'G5', 'H5', 'I5'], ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'H7', 'H8', 'H9']], 'H6': [['A6', 'B6', 'C6', 'D6', 'E6', 'F6', 'G6', 'H6', 'I6'], ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'H7', 'H8', 'H9']], 'H7': [['A7', 'B7', 'C7', 'D7', 'E7', 'F7', 'G7', 'H7', 'I7'], ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'H7', 'H8', 'H9']], 'H8': [['A8', 'B8', 'C8', 'D8', 'E8', 'F8', 'G8', 'H8', 'I8'], ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'H7', 'H8', 'H9']], 'H9': [['A9', 'B9', 'C9', 'D9', 'E9', 'F9', 'G9', 'H9', 'I9'], ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'H7', 'H8', 'H9']], 'I1': [['A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1', 'H1', 'I1'], ['I1', 'I2', 'I3', 'I4', 'I5', 'I6', 'I7', 'I8', 'I9']], 'I2': [['A2', 'B2', 'C2', 'D2', 'E2', 'F2', 'G2', 'H2', 'I2'], ['I1', 'I2', 'I3', 'I4', 'I5', 'I6', 'I7', 'I8', 'I9']], 'I3': [['A3', 'B3', 'C3', 'D3', 'E3', 'F3', 'G3', 'H3', 'I3'], ['I1', 'I2', 'I3', 'I4', 'I5', 'I6', 'I7', 'I8', 'I9']], 'I4': [['A4', 'B4', 'C4', 'D4', 'E4', 'F4', 'G4', 'H4', 'I4'], ['I1', 'I2', 'I3', 'I4', 'I5', 'I6', 'I7', 'I8', 'I9']], 'I5': [['A5', 'B5', 'C5', 'D5', 'E5', 'F5', 'G5', 'H5', 'I5'], ['I1', 'I2', 'I3', 'I4', 'I5', 'I6', 'I7', 'I8', 'I9']], 'I6': [['A6', 'B6', 'C6', 'D6', 'E6', 'F6', 'G6', 'H6', 'I6'], ['I1', 'I2', 'I3', 'I4', 'I5', 'I6', 'I7', 'I8', 'I9']], 'I7': [['A7', 'B7', 'C7', 'D7', 'E7', 'F7', 'G7', 'H7', 'I7'], ['I1', 'I2', 'I3', 'I4', 'I5', 'I6', 'I7', 'I8', 'I9']], 'I8': [['A8', 'B8', 'C8', 'D8', 'E8', 'F8', 'G8', 'H8', 'I8'], ['I1', 'I2', 'I3', 'I4', 'I5', 'I6', 'I7', 'I8', 'I9']], 'I9': [['A9', 'B9', 'C9', 'D9', 'E9', 'F9', 'G9', 'H9', 'I9'], ['I1', 'I2', 'I3', 'I4', 'I5', 'I6', 'I7', 'I8', 'I9']]};
    }
}

function initialize() {
    // Setup buttons and load solution
    let check_btn = document.getElementById("check_btn");
    let solution_btn = document.getElementById("solution_btn");
    let hint_btn = document.getElementById("hint_btn");
    let ps_assignment = get_current_pseudo_assignment();
    let solution = {};


    check_btn.addEventListener("click", function() {
        ps_assignment = get_current_pseudo_assignment();
        let result = check_consistent(ps_assignment);

        if (result["consistent"]) {
            if (assignment_complete(ps_assignment)) {
                alert("Congradulations! You finished!");
            }
            else {
                alert("So far so good...");
            }

        }
        else {
            // render errors
            render_errors([result["error"][0], result["error"][1]]);
        }
    });

    // get and load solution (with AJAX), and set up solution_btn, hint_btn
    $.ajax({
        url:"/get_kenken_solution",
        type: "POST",
        data: JSON.stringify({
            size: str_size,
            cage_map: cage_map,
            cage_restrictions: cage_restrictions
        }),
        contentType: "application/json",
        success: function(solved_assignment) {
            solution = solved_assignment;
            console.log("Here is the solution for those of you who like to peek under the hood :)")
            console.log(solution)


            // setup solution_btn
            solution_btn.addEventListener("click", function() {
                render_assignment(solution);
            });

            // setup hint_btn
            hint_btn.addEventListener("click", function() {
                let hints = get_hint_placeholders();
                ps_assignment = get_current_pseudo_assignment();


                // fill assignment with squares that will be hinted
                if (hints.length === 0) {
                    alert("Specify squares to get hints for by putting a ? in before pressing 'Hint'");
                    // hint with the first unfilled square from assignment
                    for (const square in ps_assignment) {
                        if (ps_assignment[square] === "0") {
                            ps_assignment[square] = solution[square];
                            break;
                        }
                    }

                }
                else {
                    for (let i = 0; i < hints.length; i++) {
                        ps_assignment[hints[i]] = solution[hints[i]];
                    }
                }

                // render the updated assignment
                render_assignment(ps_assignment);
            });
        }
    });
}

addEventListener("DOMContentLoaded", initialize);