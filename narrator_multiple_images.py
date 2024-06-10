import pygame
 
# activate the pygame library .
pygame.init()
screen = pygame.display.set_mode((1280, 720))



def loadimages():
   for i in range(10):
      print(i)
      imp = pygame.image.load("./frames/"+str(i)+".jpg").convert()
      imp = pygame.transform.scale(imp, (100, 100))
      screen.blit(imp, (i*100,0))
      
      pygame.display.flip()


loadimages()


pygame.display.set_caption("DAVID")
while True:
   
   for event in pygame.event.get():
      if event.type == pygame.QUIT:
         pygame.quit()
         sys.exit()