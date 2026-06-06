saldo = 100
uttak = 30

while saldo >= uttak:
    saldo -= uttak
    print(f"Tok ut {uttak} kr. Ny saldo: {saldo} kr")

print("Ikke nok penger til et nytt uttak")
