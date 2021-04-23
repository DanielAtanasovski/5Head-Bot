# given a tile location as an (x,y) tuple
# return the surrounding tiles as a list
def get_surrounding_tiles(location):

    # find all the surrounding tiles relative to us
    # location[0] = x-index; location[1] = y-index
    tile_up = (location[0], location[1]+1)  
    tile_down = (location[0], location[1]-1)    
    tile_left = (location[0]-1, location[1])
    tile_right = (location[0]+1, location[1])        
    
    # combine these into a list
    all_surrounding_tiles = [tile_up, tile_down, tile_left, tile_right]
    
    # include only the tiles that are within the game boundary
    # empty list to store our valid surrounding tiles
    valid_surrounding_tiles = []
    
    # loop through tiles
    for tile in all_surrounding_tiles:
        # check if the tile is within the boundaries of the game
        # note: the map is size 9x9
        if tile[0] >= 0 and tile[0] < 9 and \
            tile[1] >= 0 and tile[1] < 9: 
            # add valid tiles to our list
            valid_surrounding_tiles.append(tile)
    
    return valid_surrounding_tiles

# this function returns the object tag at a location
def entity_at(x,y,game_state):
    for entity in game_state["entities"]:
        if entity["x"] == x and entity["y"] == y:
            return entity["type"]

# given a list of tiles
# return the ones which are actually empty
def get_empty_tiles(tiles,game_state):

	# empty list to store our empty tiles
	empty_tiles = []

	for tile in tiles:
		if entity_at(tile[0],tile[1],game_state) is None:
			# the tile isn't occupied, so we'll add it to the list
			empty_tiles.append(tile)

	return empty_tiles

# given an adjacent tile location, move us there
def move_to_tile(location, tile):

    # see where the tile is relative to our current location
    diff = tuple(x-y for x, y in zip(location, tile))
    
    # return the action that moves in the direction of the tile
    if diff == (0,1):
        action = 'down'
    elif diff == (0,-1):
        action = 'up'
    elif diff == (1,0):
        action = 'left'
    elif diff == (-1,0):
        action = 'right'
    else:
        action = ''
    
    return action

# returns the manhattan distance between two tiles, calculated as:
# 	|x1 - x2| + |y1 - y2|
def manhattan_distance(start, end):

	distance = abs(start[0] - end[0]) + abs(start[1] - end[1])
	
	return distance

# return a list of bombs on the map
def get_bombs(game_state):

    list_of_bombs = []

    for i in game_state["entities"]:
        if i["type"] == "b":
            x = i["x"]
            y = i["y"]
            list_of_bombs.append((x,y))

    return list_of_bombs

# return a list of the bomb positions that are nearby
def get_bombs_in_range(location, bombs):

    # empty list to store our bombs that are in range of us
    bombs_in_range = []

    # loop through all the bombs placed in the game
    for bomb in bombs:

        # get our manhattan distance to a bomb
        distance = manhattan_distance(location, bomb)

        # set to some arbitrary threshold for distance
        # if we are below this threshold, we want flee bot to runaway
        if distance <= 5:
            bombs_in_range.append(bomb)

    return bombs_in_range

def get_map_danger(game_state):
    danger_map = []
    bombs = get_bombs(game_state)
    width = height = 9
    for row in range(height):
        row = []
        for col in range(width):
            row.append(entity_at(col, row, game_state))
        danger_map.append(row)
    return danger_map

# given a list of tiles and bombs
# find the tile that's safest to move to
def get_safest_tile(tiles, bombs, location):

    # which bomb is closest to us?
    bomb_distance = 10  # some arbitrary high distance
    closest_bomb = bombs[0]  # set this to the first bomb in the list for now

    # loop through the list of bombs
    for bomb in bombs:
        # calculate the manhattan distance
        new_bomb_distance = manhattan_distance(bomb,location)

        if new_bomb_distance < bomb_distance:
            # this bomb is the closest one to us so far, let's store it
            bomb_distance = new_bomb_distance
            closest_bomb = bomb

    # start with an empty dictionary
    manhattan_distances = {}

    # now we'll figure out which tile is furthest away from that bomb
    for tile in tiles:
        # get the manhattan distance from this tile to the closest bomb
        distance = manhattan_distance(tile,closest_bomb)
        # store this in a dictionary
        manhattan_distances[tile] = distance

    # return the tile with the furthest distance from any bomb
    safest_tile = max(manhattan_distances, key=manhattan_distances.get)

    return safest_tile