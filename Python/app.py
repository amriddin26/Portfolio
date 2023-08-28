def hato_berish(matn):
    birinchi_harf = matn[0].upper()
    qolgan_qism = matn[1:].lower()
    natija = birinchi_harf + qolgan_qism
    return natija

ish = input("Ishingiz haqida qisqacha izoh kiriting: ")
natija = hato_berish(ish)
print(natija)