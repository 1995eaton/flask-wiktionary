import sqlite3

conn = sqlite3.connect("dat.db")
cur = conn.cursor()

def createTable():
    cur.execute("""CREATE TABLE main
    (word text, definition text)
    """)
createTable()

f = (open("dict.txt", "r").read()).split("\n")

for line in f:
    line = line.split("\t")
    if len(line) != 3:
        continue
    sql = "INSERT INTO main VALUES (?, ?)"
    cur.execute(sql, (line[0], line[2], ))

conn.commit()
cur.close()
conn.close()
