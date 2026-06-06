def arealKvadrat(side):
    return side ** 2

def arealTrekant(grunnlinje, høyde):
    return (grunnlinje * høyde) / 2

def pythagoras(a, b):
    return (a ** 2 + b ** 2) ** 0.5

def overflateArealPyramide(side, høyde):
    grunnflate = arealKvadrat(side) # arealKvadrat(side) blir til verdier returnert i arealKvadrat()-funksjonen
    trekantHøyde = pythagoras(side / 2, høyde)
    trekant = arealTrekant(side, trekantHøyde)
    return grunnflate + 4 * trekant

print(f"Overflate av pyramide A: {overflateArealPyramide(6, 4)}") # Overflate av pyramide med 6 i sidelengde og 4 i høyde
print(f"Overflate av pyramide B: {overflateArealPyramide(10, 12)}")
print(f"Overflate av pyramide C: {overflateArealPyramide(14, 24)}")
