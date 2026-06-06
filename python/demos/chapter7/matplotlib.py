import matplotlib.pyplot as plt
import numpy

def f(x):
    return x ** 0.5 # Kvadratrot

x = numpy.linspace(1, 10, 100) # Grafens x-koordinater: fra 1 til 10, med 100 punkter

plt.plot(x, f(x), color="blue", linestyle="-") 

plt.title("Enkel graf")
plt.xlabel("x-verdier") # Setter tittel på x-aksen
plt.ylabel("y-verdier") # Setter tittel på y-aksen

plt.show()
