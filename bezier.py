def cubic_bezier(t, p0, p1, p2, p3):
    """Calcula el punto de la curva Bézier cúbica para un parámetro t."""
    return (
        (1 - t)**3 * p0 +
        3 * (1 - t)**2 * t * p1 +
        3 * (1 - t) * t**2 * p2 +
        t**3 * p3
    )

def find_t_for_x(x_target, x1, x2, epsilon=1e-6):
    """Busca t tal que x(t) aprox. = x_target usando búsqueda binaria."""
    lower, upper = 0.0, 1.0
    while lower < upper:
        t = (lower + upper) / 2
        x = cubic_bezier(t, 0, x1, x2, 1)
        if abs(x - x_target) < epsilon:
            return t
        if x < x_target:
            lower = t
        else:
            upper = t
        if upper - lower < epsilon:
            return t
    return t

def bezier_y_given_x(x_target, x1, y1, x2, y2):
    """Calcula y para un x dado en la curva cubic-bezier(x1,y1,x2,y2)."""
    t = find_t_for_x(x_target, x1, x2)
    y = cubic_bezier(t, 0, y1, y2, 1)
    return y


def bezier(x1,y1,x2,y2):
    return [bezier_y_given_x(x, x1, y1, x2, y2) for x in [i/10 for i in range(11)]]