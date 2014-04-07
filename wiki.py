from flask import Flask, request
from re import match, sub, IGNORECASE
import sqlite3

app = Flask(__name__)

conn = sqlite3.connect("dat.db")
cur = conn.cursor()

@app.route('/api', methods=['POST'])
def main():
    if request.form['type'] == "suggest":
        val = sub("^(\s+)", "", request.form['query']) + "%"
        if len(val) < 2:
            return ""
        def getRes(query):
            _res = ""
            cur.execute("SELECT DISTINCT word FROM main WHERE UPPER(word) LIKE UPPER(?) LIMIT 10", (query, ))
            for i in cur:
                _res += ", " + i[0]
            return _res
        r = getRes(val)
        if r == "" and len(r) > 2:
            getRes("%" + val + "%")
        return r
    elif request.form['type'] == "query":
        val = sub("_", "", sub("%", "", request.form['query']))
        if len(val) == 0:
            return ""
        def getRes(query):
            _res = ""
            cur.execute("SELECT definition FROM main WHERE UPPER(word) LIKE UPPER(?)", (query, ))
            for i in cur:
                print(i[0])
                _res += i[0]
            return _res
        r = getRes(val)
        if r == "" and len(r) > 2:
            getRes("%" + val + "%")
        return r

if __name__ == '__main__':
    try:
        app.run()
    except KeyboardInterrupt:
        print("Closing conntections...")
        conn.commit()
        cur.close()
        conn.close()
