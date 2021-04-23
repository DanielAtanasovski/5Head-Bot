from typing import Union
from game_state import GameState
import asyncio
import random
import os
import helpers   # import our helper functions

uri = os.environ.get(
    'GAME_CONNECTION_STRING') or "ws://127.0.0.1:3000/?role=agent&agentId=agentId&name=myAgent"

actions = ["up", "down", "left", "right"]

class Agent():
    def __init__(self):
        self._client = GameState(uri)

        self._client.set_game_tick_callback(self._on_game_tick)
        loop = asyncio.get_event_loop()
        connection = loop.run_until_complete(self._client.connect())
        tasks = [
            asyncio.ensure_future(self._client._handle_messages(connection)),
        ]
        loop.run_until_complete(asyncio.wait(tasks))

    def _get_bomb_to_detonate(self, game_state) -> Union[int, int] or None:
        agent_number = game_state.get("connection").get("agent_number")
        entities = self._client._state.get("entities")
        bombs = list(filter(lambda entity: entity.get(
            "owner") == agent_number and entity.get("type") == "b", entities))
        bomb = next(iter(bombs or []), None)
        if bomb != None:
            return [bomb.get("x"), bomb.get("y")]
        else:
            return None

    async def _on_game_tick(self, tick_number, game_state):

        ########################
        ###    VARIABLES     ###
        ########################

        my_id = str(game_state["connection"]["agent_number"]) 
        my_location = game_state["agent_state"][my_id]["coordinates"] 
        ammo = game_state["agent_state"][my_id]["inventory"]["bombs"]
        
        ########################
        ###      AGENT       ###
        ########################

        # get a list of bombs on the map
        bombs = helpers.get_bombs(game_state)
        
        # check if we're within range of a bomb
        # get list of bombs within range
        bombs_in_range = helpers.get_bombs_in_range(my_location,bombs)

        # get our surrounding tiles
        surrounding_tiles = helpers.get_surrounding_tiles(my_location)

        # get list of empty tiles around us
        empty_tiles = helpers.get_empty_tiles(surrounding_tiles,game_state)
        print(helpers.get_map_danger(game_state))

        # if I'm on a bomb, I should probably move
        if helpers.entity_at(my_location[0],my_location[1],game_state) == 'b':

            if empty_tiles:
                random_tile = random.choice(empty_tiles)
                action = helpers.move_to_tile(my_location,random_tile)
            else:
                # if there isn't a free spot to move to, we're probably stuck here
                action = ''

        # if we're near a bomb, we should also probably move
        elif bombs_in_range:

            if empty_tiles:

                # get the safest tile for us to move to
                safest_tile = helpers.get_safest_tile(empty_tiles,bombs,my_location) 
                action = helpers.move_to_tile(my_location,safest_tile)

            else:
                action = random.choice(actions) 

        # if there are no bombs in range
        else:
            # but first, let's check if we have any ammo
            if ammo > 0:
                # we've got ammo, let's place a bomb
                # action = "bomb"
                # pass
                action = random.choice(actions)
            else:
                # no ammo, we'll make random moves until we have ammo
                action = random.choice(actions) 

        # logic to send valid action packet to game server
        if action in ["up", "left", "right", "down"]:
            await self._client.send_move(action)
        elif action == "bomb":
            await self._client.send_bomb()
        elif action == "detonate":
            bomb_coordinates = self._get_bomb_to_detonate(game_state)
            if bomb_coordinates != None:
                x, y = bomb_coordinates
                await self._client.send_detonate(x, y)
        else:
            print(f"Unhandled action: {action}")

    def first_init(self, game_state):
        if (self.init):
            self.init = True
            self.map = game_state["world"]["width"]
        
    pass



def main():
    Agent()


if __name__ == "__main__":
    main()
