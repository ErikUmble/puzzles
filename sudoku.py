"""Ideas and some code adapted from http://norvig.com/sudoku.html"""

import random

def decode_assignment(assignment, blanks=" "):
        """Returns the grid corresponding with assignment"""
        grid = []
        for row in rows:
            this_row = []
            for col in cols:
                this_row.append(assignment.get(row + col, blanks))
            grid.append(this_row)
        return grid

def convert_grid_21(grid):
    """ Returns 1 dimensional grid from two dimensional """
    new_grid = []
    for row in grid:
        for val in row:
            new_grid.append(val)

    return new_grid

def convert_grid_12(grid):
    """ Returns 2 dimensional grid from 1 dimensional """
    new_grid = []
    for i in range(int(len(grid)**0.5)):
        row = []
        for j in grid[i*int(len(grid)**0.5):(i+1)*int(len(grid)**0.5)]:
            row.append(j)
        new_grid.append(row)
    return new_grid

def cross(A, B):
    """Returns the lists of cross-products of items in A and items in B) """
    return [a + b for a in A for b in B]


def shuffled(seq):
    "Return a randomly shuffled copy of the input sequence."
    seq = list(seq)
    random.shuffle(seq)
    return seq


digits = '123456789'
rows = 'ABCDEFGHI'
cols = digits
squares = cross(rows, cols)
unitlist = ([cross(rows, c) for c in cols] +
            [cross(r, cols) for r in rows] +
            [cross(rs, cs) for rs in ('ABC', 'DEF', 'GHI') for cs in ('123', '456', '789')])
Sudoku_units = dict((s, [u for u in unitlist if s in u])
                    for s in squares)
peers = dict((s, set(sum(Sudoku_units[s], [])) - {s})
             for s in squares)

difficulty_index = {
    "EASY": (36, 45),
    "MEDIUM": (27, 35),
    "HARD": (19, 26),
    "HARDER": (17, 18),
}


# random base sudokus that will get shuffled
# note that these lists are changed in running the program and cannot be depended on to be consistent
# except that they will always represent some valid sudoku solution
_sudokus = [
    [['8', '4', '5', '7', '3', '6', '1', '2', '9'], ['7', '6', '1', '2', '9', '5', '3', '4', '8'], ['9', '3', '2', '1', '8', '4', '6', '7', '5'], ['4', '8', '6', '9', '1', '2', '5', '3', '7'], ['3', '5', '9', '4', '7', '8', '2', '1', '6'], ['1', '2', '7', '5', '6', '3', '8', '9', '4'], ['6', '9', '8', '3', '2', '7', '4', '5', '1'], ['5', '1', '3', '6', '4', '9', '7', '8', '2'], ['2', '7', '4', '8', '5', '1', '9', '6', '3']],
    [['8', '2', '4', '1', '3', '9', '5', '6', '7'], ['7', '5', '6', '4', '2', '8', '1', '9', '3'], ['9', '3', '1', '5', '6', '7', '4', '8', '2'], ['3', '7', '9', '6', '5', '4', '2', '1', '8'], ['1', '6', '2', '7', '8', '3', '9', '4', '5'], ['5', '4', '8', '2', '9', '1', '3', '7', '6'], ['2', '1', '7', '3', '4', '6', '8', '5', '9'], ['6', '8', '5', '9', '1', '2', '7', '3', '4'], ['4', '9', '3', '8', '7', '5', '6', '2', '1']],
    [['4', '5', '6', '1', '2', '7', '3', '9', '8'], ['1', '9', '8', '3', '4', '5', '7', '2', '6'], ['2', '7', '3', '9', '8', '6', '4', '1', '5'], ['7', '8', '4', '2', '5', '1', '6', '3', '9'], ['9', '6', '1', '4', '3', '8', '2', '5', '7'], ['5', '3', '2', '6', '7', '9', '8', '4', '1'], ['6', '4', '9', '8', '1', '2', '5', '7', '3'], ['8', '2', '5', '7', '9', '3', '1', '6', '4'], ['3', '1', '7', '5', '6', '4', '9', '8', '2']]
    ]

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


class Sudoku:
    def combine_assignment(dim=2):
        """ Returns the [[("A1", assignment["A1]), ...],
                        [("B1", assignment["B1"]), ...],
                        ...] format of grid if dim=2, if dim=1 returns the flattened version"""
        grid = []
        if dim==2:
            for row in squares:
                grid_row = []
                for index in row:
                    grid_row.append((index, self.domains[index]))
                grid.append(grid_row)
        # Otherwise make the flattened version
        elif dim==1:
            for row in squares:
                for index in row:
                    grid.append((index, self.domains[index]))
        return grid


    def __init__(self, grid=None, generate=False, difficulty=None, N=17):
        if generate:
            if difficulty is None:
                self.domains = self.random_puzzle(N)
            else:
                self.domains = self.random_puzzle(random.randint(difficulty_index[difficulty][0], difficulty_index[difficulty][1]))
        else:
            self.domains = {
                square: digits
                for square in squares
            }
            if grid is not None:
                self.load_grid(grid)

    def load_grid(self, grid):
        """Loads a grid[[]] of grid[row][col] form into Sudoku object,
        removes domain values from already assigned squares
        returns True if successful"""

        for row_num, row in enumerate(grid):
            for col_num, value in enumerate(row):
                value = str(value)
                if value in digits and len(value) == 1:
                    # assign the value to "A" + "2" or whatever other square name
                    self.domains = self.assign(self.domains, rows[row_num] + cols[col_num], value)

        return True

    def decode_assignment(self, assignment=None, blanks=" "):
        """Returns the grid corresponding with assignment"""
        grid = []
        if assignment is None:
            assignment = self.assignment()
        for row in rows:
            this_row = []
            for col in cols:
                this_row.append(assignment.get(row + col, blanks))
            grid.append(this_row)
        return grid

    def assignment_complete(self, values=None):
        """:returns True if assignment maps every square to a value"""
        if values is None:
            return all(len(self.domains[square]) == 1 for square in squares)
        else:
            return all(len(values[square]) == 1 for square in squares)

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
        if len(values[square]) == 0:
            # We have removed the last domain option
            return False
        elif len(values[square]) == 1:
            d2 = values[square]
            if not all(self.eliminate(values, s2, d2) for s2 in peers[square]):
                return False
        # 2nd inference
        # If a unit u is reduced to only one place for a value d, then put it there.
        for u in Sudoku_units[square]:
            options = [s for s in u if digit in values[s]]
            if len(options) == 0:
                # Contradiction: no place for this value
                return False
            elif len(options) == 1:
                # d can only be in one place in unit; assign it there
                if not self.assign(values, options[0], digit):
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
        for square, digit in assignment.items():
            for peer_unit in Sudoku_units[square]:
                for peer in peer_unit:
                    # if a peer has the same digit assigned to it, the assignment is not consistent
                    if peer != square and assignment.get(peer, "Different") == digit:
                        return False
        return True

    def select_unassigned_variable(self, values=None):
        """:returns the next unassigned square,
        choosing the one with the smallest domain that has not yet been assigned"""
        if values is None:
            values = self.domains
        num_vals, square = min((len(s), s) for s in squares if len(values[s]) > 1)
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
            for peer_unit in Sudoku_units[square]:
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

    def shuffle_slice(a, start, stop):
        """Knuth shuffle of the list between [start, stop)"""
        i = start
        while (i < stop-1):
            idx = random.randrange(i, stop)
            a[i], a[idx] = a[idx], a[i]
            i += 1

    def get_shuffled_sudoku(self):
        """Shuffles some completed sudoku with valid changes and returns the grid"""
        raise Exception("Not implemented")
        base = sudokus[random.randint(3)]

        # shuffle within each horizontal group
        for i in range(3):
            shuffle_slice(base, i*3, i*4)

    def puzzle_from_solution(self, N=17):
        """Given a complete, solved sudoku, removes 81 - N assignments and returns the grid"""
        pass

    def random_puzzle(self, N=17):
        """Make a random puzzle with N or more assignments. Restart on contradictions.
        Note the resulting puzzle is not guaranteed to be solvable, but empirically
        about 99.8% of them are solvable. Some have multiple solutions."""
        values = dict((s, digits) for s in squares)
        for s in shuffled(squares):
            if not self.assign(values, s, random.choice(values[s])):
                break
            ds = [values[s] for s in squares if len(values[s]) == 1]
            if len(ds) >= N and len(set(ds)) >= 8:
                return values
        return self.random_puzzle(N)  # Give up and make a new puzzle
