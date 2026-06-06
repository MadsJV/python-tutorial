elev = {} # Lager et tomt dictionary

elev["navn"] = "Anna"  # Legger til navn
elev["karakter"] = "A" # Legger til karakter

print(elev)

elev["karakter"] = "A+" # Endrer karakteren til A+
print(elev)

del elev["karakter"]    # Sletter karakteren (del = delete)
print(elev)
