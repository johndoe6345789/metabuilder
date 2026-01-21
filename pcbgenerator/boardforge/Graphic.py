class Graphic:

    def __init__(self, layer, commands):
        self.layer = layer
        self.commands = commands

    def render(self):
        return self.commands
