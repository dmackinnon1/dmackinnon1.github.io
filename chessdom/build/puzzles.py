# mathematical chess puzzles
# This script will output a set of mathematical chess puzzles in json format
# for use with an interactive solver

import os
# 1. generic json functions
def att(name, value):
    result = "\""+ name +"\": "
    if (isinstance(value, int)):
        result += str(value)
    elif (value[0] == '['):
        result += str(value)
    else:
        result += "\"" + str(value) + "\""
    return result

def json(attributes):
    result = "{"
    first = True
    for pair in attributes:
        if not first:
            result += ", "
        first = False
        result += pair
    result += "}"
    return result

def jarr(items):
    result = "["
    first = True
    for pair in items:
        if not first:
            result += ", "
        first = False
        result += pair
    result += "]"
    return result

def bigjarr(jsons):
    result = "[\n" 
    first = True
    for js in jsons:
        if not first:
            result += ","
            result += "\n"
        first = False
        result += "\t"
        result += js
    result += "\n]"
    return result;

# 2. puzzle-json specific functions
def piece(name, count):
    return json([att("name", name), att("count", count)])


def puzzle(name, size, cover, unguard, pieces):
    return json([
        att("name",name), 
        att("size",size), 
        att("cover", cover), 
        att("unguard", unguard),
        att("pieces", jarr(pieces))
    ])
 
# 3. defining specific puzzles
puzzles = []
#queens 
puzzles.append(puzzle("2 queens on 4x4",4, "true", "false", [piece("queen",2)]))
puzzles.append(puzzle("3 queens on 4x4",4, "true", "true", [piece("queen",3)]))
puzzles.append(puzzle("4 queens on 4x4", 4, "true", "true", [piece("queen",4)]))

puzzles.append(puzzle("3 queens on 5x5", 5, "true", "false", [piece("queen",3)]))
puzzles.append(puzzle("4 queens on 5x5", 5, "true", "true", [piece("queen",4)]))
puzzles.append(puzzle("5 queens on 5x5", 5, "true", "true", [piece("queen",5)]))

puzzles.append(puzzle("3 queens on 6x6", 6, "true", "false", [piece("queen",3)]))
puzzles.append(puzzle("4 queens on 6x6", 6, "true", "false", [piece("queen",4)]))
puzzles.append(puzzle("5 queens on 6x6", 6, "true", "true", [piece("queen",5)]))
puzzles.append(puzzle("6 queens on 6x6", 6, "true", "true", [piece("queen",6)]))


puzzles.append(puzzle("4 queens on 7x7", 7, "true", "true", [piece("queen",4)]))
puzzles.append(puzzle("5 queens on 7x7", 7, "true", "true", [piece("queen",5)]))
puzzles.append(puzzle("6 queens on 7x7", 7, "true", "true", [piece("queen",6)]))
puzzles.append(puzzle("7 queens on 7x7", 7, "true", "true", [piece("queen",7)]))

puzzles.append(puzzle("5 queens on 8x8", 8, "true", "true", [piece("queen",5)]))
puzzles.append(puzzle("6 queens on 8x8", 8, "true", "true", [piece("queen",6)]))
puzzles.append(puzzle("7 queens on 8x8", 8, "true", "true", [piece("queen",7)]))
puzzles.append(puzzle("8 queens on 8x8", 8, "true", "true", [piece("queen",8)]))

#knights
puzzles.append(puzzle("5 knights on 3x3", 3, "true", "true", [piece("knight",5)]))

puzzles.append(puzzle("4 knights on 4x4", 4, "true", "true", [piece("knight",4)]))
puzzles.append(puzzle("5 knights on 4x4", 4, "true", "true", [piece("knight",5)]))
puzzles.append(puzzle("8 knights on 4x4", 4, "true", "true", [piece("knight",8)]))

puzzles.append(puzzle("5 knights on 5x5", 5, "true", "true", [piece("knight",5)]))
puzzles.append(puzzle("8 knights on 5x5", 5, "true", "true", [piece("knight",8)]))
puzzles.append(puzzle("9 knights on 5x5", 5, "true", "true", [piece("knight",9)]))
puzzles.append(puzzle("10 knights on 5x5", 5, "true", "true", [piece("knight",10)]))
puzzles.append(puzzle("11 knights on 5x5", 5, "true", "true", [piece("knight",11)]))
puzzles.append(puzzle("12 knights on 5x5", 5, "true", "true", [piece("knight",12)]))
puzzles.append(puzzle("13 knights on 5x5", 5, "true", "true", [piece("knight",13)]))

puzzles.append(puzzle("8 knights on 6x6", 6, "true", "true", [piece("knight",8)]))
puzzles.append(puzzle("11 knights on 6x6", 6, "true", "true", [piece("knight",11)]))
puzzles.append(puzzle("12 knights on 6x6", 6, "true", "true", [piece("knight",12)]))
puzzles.append(puzzle("14 knights on 6x6", 6, "true", "true", [piece("knight",14)]))
puzzles.append(puzzle("18 knights on 6x6", 6, "true", "true", [piece("knight",18)]))

puzzles.append(puzzle("10 knights on 7x7", 7, "true", "false", [piece("knight",10)]))
puzzles.append(puzzle("14 knights on 7x7", 7, "true", "true", [piece("knight",14)]))
puzzles.append(puzzle("17 knights on 7x7", 7, "true", "true", [piece("knight",17)]))
puzzles.append(puzzle("24 knights on 7x7", 7, "true", "true", [piece("knight",24)]))
puzzles.append(puzzle("25 knights on 7x7", 7, "true", "true", [piece("knight",25)]))

puzzles.append(puzzle("12 knights on 8x8", 8, "true", "false", [piece("knight",12)]))
puzzles.append(puzzle("16 knights on 8x8", 8, "true", "false", [piece("knight",16)]))
puzzles.append(puzzle("32 knights on 8x8", 8, "true", "false", [piece("knight",32)]))


#rook 
puzzles.append(puzzle("4 rooks on 4x4", 4, "true", "true", [piece("rook",4)]))
puzzles.append(puzzle("5 rooks on 5x5", 5, "true", "true", [piece("rook",5)]))
puzzles.append(puzzle("6 rooks on 6x6", 6, "true", "true", [piece("rook",6)]))

#bishop 
puzzles.append(puzzle("4 bishops on 4x4", 4, "true", "true", [piece("bishop",4)]))
puzzles.append(puzzle("5 bishops on 4x4", 4, "true", "true", [piece("bishop",5)]))
puzzles.append(puzzle("6 bishops on 4x4", 4, "true", "true", [piece("bishop",6)]))

puzzles.append(puzzle("5 bishops on 5x5", 5, "true", "true", [piece("bishop",5)]))
puzzles.append(puzzle("6 bishops on 5x5", 5, "true", "true", [piece("bishop",6)]))
puzzles.append(puzzle("7 bishops on 5x5", 5, "true", "true", [piece("bishop",7)]))
puzzles.append(puzzle("8 bishops on 5x5", 5, "true", "true", [piece("bishop",8)]))

puzzles.append(puzzle("7 bishops on 7x7", 7, "true", "true", [piece("bishop",7)]))
puzzles.append(puzzle("8 bishops on 7x7", 7, "true", "true", [piece("bishop",8)]))
puzzles.append(puzzle("9 bishops on 7x7", 7, "true", "true", [piece("bishop",9)]))
puzzles.append(puzzle("10 bishops on 7x7", 7, "true", "true", [piece("bishop",10)]))
puzzles.append(puzzle("11 bishops on 7x7", 7, "true", "true", [piece("bishop",11)]))
puzzles.append(puzzle("12 bishops on 7x7", 7, "true", "true", [piece("bishop",12)]))

puzzles.append(puzzle("8 bishops on 8x8", 8, "true", "true", [piece("bishop",8)]))
puzzles.append(puzzle("10 bishops on 8x8", 8, "true", "true", [piece("bishop",10)]))
puzzles.append(puzzle("14 bishops on 8x8", 8, "true", "true", [piece("bishop",14)]))

#king 
puzzles.append(puzzle("4 kings on 5x5", 5, "true", "true", [piece("king",4)]))
puzzles.append(puzzle("9 kings on 5x5", 5, "true", "true", [piece("king",9)]))

puzzles.append(puzzle("4 kings on 6x6", 6, "true", "true", [piece("king",4)]))
puzzles.append(puzzle("9 kings on 6x6", 6, "true", "true", [piece("king",9)]))

puzzles.append(puzzle("9 kings on 7x7", 7, "true", "true", [piece("king",9)]))

puzzles.append(puzzle("9 kings on 8x8", 8, "true", "true", [piece("king",9)]))


# 4. printing puzzle file
print('-------------------------------------------')
print('Generating Chess Puzzle Data.')
print(' --- creating file ../data/puzzles.json')
directory = "../data"
if not os.path.exists(directory):
    os.makedirs(directory)
f = open(directory + "/puzzles.json","w")
f.write(bigjarr(puzzles))
f.close()
print(' --- done')
f.close()
