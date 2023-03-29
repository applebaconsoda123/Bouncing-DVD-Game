 import pygame
import random
import numpy as np

# Initialize pygame
pygame.init()

# Set screen dimensions and create screen
screen_width = 800
screen_height = 600
screen = pygame.display.set_mode((screen_width, screen_height))

# Set DVD logo dimensions
logo_width = 100
logo_height = 30

# Set up hit map
hit_map = np.zeros((screen_width, screen_height))

class DvdLogo:
    def __init__(self):
        self.x = random.randint(0, screen_width - logo_width)
        self.y = random.randint(0, screen_height - logo_height)
        self.vx = 2
        self.vy = 2

    def update(self):
        self.x += self.vx
        self.y += self.vy

        if self.x <= 0 or self.x + logo_width >= screen_width:
            self.vx = -self.vx

        if self.y <= 0 or self.y + logo_height >= screen_height:
            self.vy = -self.vy

        # Update hit map within screen bounds
        for x in range(max(0, self.x), min(screen_width, self.x + logo_width)):
            for y in range(max(0, self.y), min(screen_height, self.y + logo_height)):
                hit_map[x][y] += 1

# Create DVD logo instance
dvd_logo = DvdLogo()

# Run simulation
for _ in range(50000):
    dvd_logo.update()

# Normalize hit map
hit_map = hit_map / np.max(hit_map)

# Draw hit map
for x in range(screen_width):
    for y in range(screen_height):
        intensity = hit_map[x][y]
        color = (255, int(255 * (1 - intensity)), 0)
        screen.set_at((x, y), color)

# Main loop
running = True
while running:
    # Handle events
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False

    # Update the display
    pygame.display.flip()

# Quit pygame
pygame.quit()
