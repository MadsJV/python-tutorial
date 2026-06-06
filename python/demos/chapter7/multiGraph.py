import matplotlib.pyplot as plt
import numpy

def f(x):
    return x**2

def g(x):
    return x**3

x = numpy.linspace(-10, 10, 100)

plt.plot(x, f(x), color="blue", label="f")
plt.plot(x, g(x), color="red", label="g")
plt.legend()

plt.show()