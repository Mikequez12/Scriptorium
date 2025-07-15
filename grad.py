from bezier import bezier

l = bezier(.5,0,.5,1)

for i,p in enumerate(l):
    n = (i+1)/len(l)
    print(f'rgba(0, 0, 0, {p}){"," if i+1<len(l) else ''} /* {round(n*100)}% */')