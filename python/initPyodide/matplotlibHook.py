import matplotlib.pyplot as plt
import base64
from io import BytesIO

graphContainer = None
plotWindow = None

def customShow(*args, **kwargs):
    global graphContainer, plotWindow

    buf = BytesIO()
    plt.savefig(buf, format="png")
    buf.seek(0)

    img = base64.b64encode(buf.read()).decode("utf-8")
    src = "data:image/png;base64," + img

    if graphContainer is not None:
        graphContainer.innerHTML = (
            '<img style="max-width:100%;" src="' + src + '"/>'
        )

    if plotWindow is not None:
        plotWindow(src)

    plt.clf()

plt.show = customShow
