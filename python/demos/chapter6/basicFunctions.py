def sjekkVoksenhet(alder, saldo): # Dette er samme eksempel fra 3b, men nå er det 
    if alder >= 18:               # samlet i en funksjon og lett å bruke flere ganger
        print("Du er voksen.")
    else:
        print("Du er ikke voksen.")

    if alder >= 18 and saldo > 0:
        print("Du er voksen og ikke i gjeld!")
    else:
        print("Du er enten ikke voksen eller i gjeld.")

sjekkVoksenhet(20, 500)
print("\n") # Lager tomme linjer for å gjøre det lettere å lese outputen
sjekkVoksenhet(17, 500)
print("\n")
sjekkVoksenhet(20, -100)
