a = 2
n = 5
S = 0
for i in range(1, n+1):
    S = S + a
    a = a + (i + 2)
print(S)