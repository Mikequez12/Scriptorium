import json
import rich
import pyperclip as clipboard

with open('datapacks/Urban-Shadows/scripts/EN.json','r',encoding='utf-8') as file:
    script = json.load(file)

def replace(line):
    if type(line) == list:
        return ['',[line[0]],line[1:]]
    elif type(line) == dict:
        return {k:analyze(v) for k,v in line.items()}
    else:
        return line

def analyze(script):
    if type(script) == list:
        return [replace(line) for line in script]
    return script

clipboard.copy(
    json.dumps(
        analyze(script),
        ensure_ascii=False,
        indent=4
    )
)