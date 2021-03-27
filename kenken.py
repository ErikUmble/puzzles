"""Ideas and some code adapted from http://norvig.com/sudoku.html"""

import random

def generate_random_kenken(size, operations_available=("+", "-", "*", "/", "=")):
    ## TEMP
    return Kenken(size, file="kenken_grids/test_kenken"+ str(size) + ".txt", operations_available=operations_available)

class CageMap(dict):
    # https://stackoverflow.com/questions/3318625/how-to-implement-an-efficient-bidirectional-hash-table
    """
    Assign each square to the name of its cage,
    then CageMap().cages["cage_name"] gives a list of squares assigned to "cage_name"
    """
    def __init__(self, *args, **kwargs):
        super(CageMap, self).__init__(*args, **kwargs)
        self.cages = {}
        for key, value in self.items():
            self.cages.setdefault(value, []).append(key)

    def __setitem__(self, key, value):
        if key in self:
            self.cages[self[key]].remove(key)
        super(CageMap, self).__setitem__(key, value)
        self.cages.setdefault(value, []).append(key)

    def __delitem__(self, key):
        self.cages.setdefault(self[key], []).remove(key)
        if self[key] in self.cages and not self.cages[self[key]]:
            del self.cages[self[key]]
        super(CageMap, self).__delitem__(key)


def cross(A, B):
    """Returns the lists of cross-products of items in A and items in B) """
    return [a + b for a in A for b in B]


def shuffled(seq):
    "Return a randomly shuffled copy of the input sequence."
    seq = list(seq)
    random.shuffle(seq)
    return seq


def parse_grid(grid_string):
    """:returns grid[row][col] form
    Returns False if invalid grid"""
    grid_string = grid_string.strip()
    if len(grid_string) != 81:
        return False

    grid = []
    index = 0
    for row in range(9):
        this_row = []
        for col in range(9):
            this_row.append(grid_string[index])
            index += 1
        grid.append(this_row)
    return grid


def some(seq):
    """Return some element of seq that is true."""
    for e in seq:
        if e:
            return e
    return False


# Define operation constants
ADD = 0
SUB = 1
MULT = 2
DIV = 3
EQ = 4

op_inverse = {
    ADD: SUB,
    SUB: ADD,
    MULT: DIV,
    DIV: MULT
}

# Define style constants
SOLID = True#"solid"
DOTTED = False#"dotted"


def operate(operator, arg1, arg2):
    if operator == ADD:
        return arg1 + arg2
    elif operator == SUB:
        return arg1 - arg2
    elif operator == MULT:
        return arg1 * arg2
    elif operator == DIV:
        return arg1 / arg2


def valid_combination(operator, result_value, values):
    """:returns true if the values are operated on to produce result_value
    for division and subtraction, only handles 2 values, and takes the max to be the dividend or positive value"""
    if operator == ADD:
        return sum(values) == result_value
    elif operator == SUB:
        return max(values) - min(values) == result_value
    elif operator == MULT:
        prod = 1
        for val in values:
            prod *= val
        return prod == result_value
    elif operator == DIV:
        return max(values) / min(values) == result_value
    elif operator == EQ:
        return values[0] == result_value


def possible_permutations(operator, result_value, num_elements, size):
    if operator == EQ:
        return result_value

    # handle base case
    if num_elements == 2:
        permutations = []
        pos_first = [i for i in range(1, size + 1)]  # possible first square values
        for i in pos_first:
            # for possible second square values
            for j in range(1, size + 1):
                if operate(operator, i, j) == result_value:
                    permutations.append(str(i) + str(j))
        return permutations
    else:
        permutations = []
        for i in range(1, size + 1):
            for perm in [str(i) + other_squares for other_squares in
                         possible_permutations(operator,
                                               operate(op_inverse[operator], result_value, i),
                                               num_elements - 1,
                                               size)]:
                permutations.append(perm)
        return permutations


def possible_combinations(operator, result_value, num_elements, size):
    """:returns a list of strings of length num_elements,
    each of which correspond with a different combination (not permutation)
    that, when operated on result in the cage result_value
    Note that for '-' and '/' using num_elements > 2 could lead to unexpected results
    ie. for 5+ 3_elements and kenken_board_size=6 ->
    [
        "113",
        "112",
    ]
    returns [""] if no combinations exist
    """
    if operator == EQ:
        return result_value

    # handle base case
    if num_elements == 2:
        combinations = []
        pos_first = [i for i in range(1, size + 1)]  # possible first square values
        not_first = []  # values removed to avoid duplicates
        for i in pos_first:
            if i in not_first:
                continue
            # for possible second square values
            for j in range(1, size + 1):
                if operate(operator, i, j) == result_value:
                    not_first.append(j)
                    combinations.append(str(i) + str(j))
        return combinations

    # for each of the possible values for a single square, find the possible combinations
    # for the other squares with a recursive call with num_elements - 1 and result as the amount left to get to
    # using the inverse operation (ie. for 7+, if we assign the first square as 2, we need the other squares to
    # add up to 7-2=5 since '-' is the inverse of '+'
    combinations = []
    for i in range(1, size + 1):

        for comb in [str(i) + other_squares for other_squares in
                     possible_combinations(operator, operate(op_inverse[operator], result_value, i), num_elements - 1,
                                           size)]:
            combinations.append(comb)
    return combinations


def possible_set(operator, result_value, num_elements, size, current_possible=None):
    """:returns set of possible values that combine with operator to make result_value
    Note that values in the set are in string form"""
    if current_possible is None:
        current_possible = set()
    ##
    # This is probably inefficient, but works for now
    ##
    if operator == EQ or num_elements < 2:
        return {str(int(result_value))}

    # handle base case
    if num_elements == 2:
        pos_first = [i for i in range(1, size + 1)]  # possible first square values
        for i in pos_first:
            # for possible second square values
            for j in range(1, size + 1):
                if operate(operator, i, j) == result_value:
                    current_possible.add(str(i))
                    current_possible.add(str(j))
        return current_possible
    else:
        for i in range(1, size + 1):
            current_possible |= (possible_set(operator,
                                              operate(op_inverse[operator], result_value, i),
                                              num_elements - 1,
                                              size))

        return current_possible


class Kenken:
    operation_map = {
        "+": ADD,
        "-": SUB,
        "*": MULT,
        "x": MULT,
        "/": DIV,
        "÷": DIV,
        "!": EQ,
        "=": EQ
    }
    reverse_op_map = {
        val: key for key, val in operation_map.items()
    }

    def __init__(self, size, file=None, operations_available=("+", "-", "*", "/", "=")):
        self.size = size
        self.digits = '123456789'[:size]
        self.rows = 'ABCDEFGHI'[:size]
        self.cols = self.digits
        self.operations = [Kenken.operation_map[op] for op in operations_available]
        self.squares = cross(self.rows, self.cols)
        self.unitlist = ([cross(self.rows, c) for c in self.cols] +
                    [cross(r, self.cols) for r in self.rows])
        self.Kenken_units = dict((s, [u for u in self.unitlist if s in u])
                            for s in self.squares)
        self.peers = dict((s, set(sum(self.Kenken_units[s], [])) - {s})
                     for s in self.squares)

        self.domains = self.domains = {
                square: self.digits
                for square in self.squares
            }
        self.cage_map = CageMap()  # of the form {"A1": "cage1", "A2": "cage4", ... }
        self.cage_restrictions = dict()  # of the form {"cage1": (5, ADD), "cage2": (3, DIV), ...}
        # store the border conditions of the cell: each border can be either SOLID or DOTTED
        self.square_borders = dict()  # of the form {"A1": [top, right, bottom, left], }

        if file is not None:
            self.load_file(file)

    def load_kenken(self, cage_map, cage_restrictions):
        # Load the CageMap() object, by iterating through the [regular] dictionary
        for square, cage in cage_map.items():
            self.cage_map[square] = cage
        self.cage_restrictions = cage_restrictions
        self.update_domains()
        self.square_borders = self.get_borders()

    def load_file(self, filename):
        """loads Kenken object (domains and cage_map) from .txt file
        using neknek format (http://www.mlsite.net/neknek/)
        requires that kenken specified in file matches the size and operators constraints of this kenken object
        :returns None if successful, else returns error message"""
        num_cages = 0
        try:
            with open(filename, "r") as file:
                r1 = file.readline().split()
                if r1[0].strip() != "#":
                    return "Format must begin with '# size' on first line"

                if int(r1[1].strip()) != self.size:
                    return "Size of kenken does not match size specified in file"

                for line in file:
                    line = line.split()
                    if not line:
                        continue
                    operator = Kenken.operation_map.get(line[0], None)
                    if operator is None or operator not in self.operations:
                        return f"Invalid operator {line[0]}"

                    this_cage = "cage" + str(num_cages)
                    num_cages += 1
                    # make an initial loading inference
                    if operator == EQ:
                        self.domains[line[2]] = line[1]
                    self.cage_restrictions[this_cage] = (int(line[1]), operator)
                    for i in range(2, len(line)):
                        self.cage_map[line[i]] = this_cage
            self.update_domains()
            self.square_borders = self.get_borders()
        except FileNotFoundError:
            return "FileNotFoundError"

    def get_borders(self, cage_map=None, size=None):
        """returns a dictionary in the form {"A1": [top, right, bottom, left], ...}
        where top, right, bottom, and left are either DOTTED or SOLID
        uses self kenken object mapping, or can be specified with parameters"""
        cage_map = cage_map or self.cage_map
        size = size or self.size
        rows = 'ABCDEFGHI'[:size]
        cols = '123456789'[:size]
        squares = cross(rows, cols)
        borders = {}
        # initialize borders with dotted lines (except for the border which is solid)
        for square in squares:
            top = SOLID if square[0] == rows[0] else DOTTED
            right = SOLID if square[1] == cols[-1] else DOTTED
            bottom = SOLID if square[0] == rows[-1] else DOTTED
            left = SOLID if square[1] == cols[0] else DOTTED
            borders[square] = [top, right, bottom, left]
        # For each neighboring pair of squares, if they are part of the same cage, connect with dotted, otherwise solid
        for row in range(size):
            for col in range(size):
                # check each side, ignore "squares" that would be outside the grid
                # top
                if row > 0:
                    # See if not in the same cage as the square above
                    if not cage_map[rows[row] + cols[col]] == cage_map[rows[row - 1] + cols[col]]:
                        borders[rows[row] + cols[col]][0] = SOLID
                # right
                if col < size - 1:
                    if not cage_map[rows[row] + cols[col]] == cage_map[rows[row] + cols[col + 1]]:
                        borders[rows[row] + cols[col]][1] = SOLID
                # bottom
                if row < size - 1:
                    if not cage_map[rows[row] + cols[col]] == cage_map[rows[row + 1] + cols[col]]:
                        borders[rows[row] + cols[col]][2] = SOLID
                # left
                if col > 0:
                    if not cage_map[rows[row] + cols[col]] == cage_map[rows[row] + cols[col - 1]]:
                        borders[rows[row] + cols[col]][3] = SOLID
        return borders

    def update_domains(self):
        """Limits each square's domain to values allowed by inherent cage restrictions"""
        regular_domain = {val for val in self.digits}
        for cage, restrictions in self.cage_restrictions.items():
            squares = self.cage_map.cages[cage]
            # get a set of the possible values that fit in this cage
            restricted_domain = possible_set(restrictions[1], restrictions[0], len(squares), self.size)
            # remove any value from each cage square's domain that is not possible
            for eliminated_value in regular_domain - restricted_domain:
                for square in squares:
                    self.domains[square] = self.domains[square].replace(str(eliminated_value), "")

    def load_grid(self, grid):
        """Loads a grid[[]] of grid[row][col] form into Sudoku object,
        removes domain values from already assigned squares
        returns True if successful"""

        for row_num, row in enumerate(grid):
            for col_num, value in enumerate(row):
                value = str(value)
                if value in self.digits and len(value) == 1:
                    # assign the value to "A" + "2" or whatever other square name
                    self.domains = self.assign(self.domains, self.rows[row_num] + self.cols[col_num], value)

        return True

    def decode_assignment(self, assignment=None, blanks=" "):
        """Returns the grid corresponding with assignment"""
        grid = []
        if assignment is None:
            assignment = self.assignment()
        for row in self.rows:
            this_row = []
            for col in self.cols:
                this_row.append(assignment.get(row + col, blanks))
            grid.append(this_row)
        return grid

    def assignment_complete(self, values=None):
        """:returns True if assignment maps every square to a value"""
        if values is None:
            return all(len(self.domains[square]) == 1 for square in self.squares)
        else:
            return all(len(values[square]) == 1 for square in self.squares)

    def assign(self, values, s, d):
        """Eliminate all the other values (except d) from values[s] and propagate.
        Return values, except return False if a contradiction is detected."""
        other_values = values[s].replace(d, '')
        if all(self.eliminate(values, s, d2) for d2 in other_values):
            return values
        else:
            return False

    def eliminate(self, values, square, digit):
        """Eliminate d from values[s]; propagate when values or places <= 2.
        Return values, except return False if a contradiction is detected."""
        if digit not in values[square]:
            # We have already eliminated this digit
            return values
        # Eliminate the value
        values[square] = values[square].replace(digit, '')
        # 1st inference If there is only one domain option left in the square, we need to assign the square that value
        # And in doing so, eliminate that value from its peers.
        # (part 2) And update the values of cage members
        if len(values[square]) == 0:
            # We have removed the last domain option
            return False
        elif len(values[square]) == 1:
            d2 = values[square]
            if not all(self.eliminate(values, s2, d2) for s2 in self.peers[square]):
                return False
            # part 2

            cage = self.cage_map[square]
            (result_value, operator) = self.cage_restrictions[cage]
            # We limit division and subtraction cages to having two elements
            if operator == DIV:
                new_possible = {str(int(d2) / result_value), str(int(d2) * result_value)}
            elif operator == SUB:
                new_possible = {str(int(d2) - result_value), str(int(d2) + result_value)}
            else:
                # get the set of the numbers that are now available for members of this cage
                new_possible = possible_set(operator,
                                             operate(op_inverse[operator], result_value, int(d2)),
                                             len(self.cage_map.cages[cage]) - 1,
                                             self.size)

            for cage_member in self.cage_map.cages[cage]:
                if cage_member != square:
                    # eliminate the values that had been in the member's domain, but are now unavailable
                    if not all(self.eliminate(values, cage_member, eliminated_value) for eliminated_value in
                               {val for val in values[cage_member]} - new_possible):
                        return False
        # 2nd inference
        # If a unit u is reduced to only one place for a value d, then put it there.
        for u in self.Kenken_units[square]:
            options = [s for s in u if digit in values[s]]
            if len(options) == 0:
                # Contradiction: no place for this value
                return False
            elif len(options) == 1:
                # d can only be in one place in unit; assign it there
                if not self.assign(values, options[0], digit):
                    return False
        # 2nd inference part 2
        # If all but one members of a cage are assigned, we know what must go in the unassigned member
        for cage, restriction in self.cage_restrictions.items():
            squares = self.cage_map.cages[cage]
            cage_values = []
            only_unassigned = None
            # Find the one unassigned member, or skip this inference if there is not one
            for square in squares:
                if len(values[square]) != 1:
                    if only_unassigned is not None:
                        only_unassigned = square
                    else:
                        only_unassigned = None
                        break
                else:
                    cage_values.append(int(values[square]))

            if only_unassigned is not None:
                # eliminate this square's values besides the one it must be assigned
                for val in values[only_unassigned]:
                    if not valid_combination(restriction[1], restriction[0], cage_values.copy().append(int(val))):
                        if not self.eliminate(values, square, val):
                            return False
        return values

    def assignment(self):
        """Returns 'assignment' dictionary generated from self.domains"""
        assignment = {}
        for square, values in self.domains.items():
            if len(values) == 1:
                assignment[square] = values

        return assignment

    def consistent(self, assignment=None):
        """Returns True if the no Sudoku rules are violated in the assignment
        otherwise returns False"""
        if assignment is None:
            assignment = self.assignment()

        # Check rows and cols (units)
        for square, digit in assignment.items():
            for peer_unit in self.Kenken_units[square]:
                for peer in peer_unit:
                    # if a peer has the same digit assigned to it, the assignment is not consistent
                    if peer != square and assignment.get(peer, "Different") == digit:
                        return False

        # Check cages
        for cage, restriction in self.cage_restrictions.items():
            squares = self.cage_map.cages[cage]

            # only check consistency of filled cages
            filled = True
            these_values = []
            for square in squares:
                val = assignment.get(square, "not_assigned")
                if len(val) == 1:
                    these_values.append(int(val))
                else:
                    filled = False
                    break
            if filled:
                if not valid_combination(restriction[1], restriction[0], these_values):
                    return False
        return True

    def select_unassigned_variable(self, values=None):
        """:returns the next unassigned square,
        choosing the one with the smallest domain that has not yet been assigned"""
        if values is None:
            values = self.domains
        num_vals, square = min((len(s), s) for s in self.squares if len(values[s]) > 1)
        return square

    def order_domain_values(self, square, values=None):
        """
        Return a list of values in the domain of 'square', in order by
        the number of values they rule out for peers.
        The first value in the list, for example, should be the one
        that rules out the fewest values among the peers of 'square'.
        """
        if values is None:
            values = self.domains
        domain_values = {}
        for digit in values[square]:
            count = 0
            for peer_unit in self.Kenken_units[square]:
                for peer in peer_unit:
                    # Will the digit assignment rule out an option from peer (which must not already be assigned)
                    if peer != square and digit in peer:
                        count += 1
            domain_values[digit] = count

        return sorted(domain_values, key=lambda x: domain_values[x])

    def search_dfs(self, values):
        """Using depth-first search and propagation, try all possible values."""
        if values is False:
            # Failed earlier
            return False
        if self.assignment_complete(values):
            # make sure the "solution" obeys kenken rules
            if not self.consistent(values):
                return False
            # Solved
            return values
        # Try assigning values to the next unassigned_variable
        square = self.select_unassigned_variable(values)
        return some(self.search_dfs(self.assign(values.copy(), square, digit))
                    for digit in self.order_domain_values(square, values))

    def solve(self):
        """:returns assignment, grid of solved Sudoku game, or None, None if grid is invalid or no solution
        Updates self.domains to be the completed assignment"""
        result = self.search_dfs(self.domains)
        if result is not False:
            self.domains = result
            return result, self.decode_assignment(result)
        return None, None





