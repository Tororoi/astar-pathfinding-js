class Node {
    constructor(x,y) {
        this.x = x;
        this.y = y;
        this.g = 0;
        this.h = 0;
        this.f = 0;
        this.type = "free";
        this.parent = null;
    }

    get pathCost() {
        let current = this;
        let path = [];
        let cost = 0;
        while(current.parent) {
            path.push(current);
            let step = getDistance(curr.x,curr.y,curr.parent.x,curr.parent.y);
            cost += step;
            curr = curr.parent;   
        }
        return cost
    }

    calcCost() {
        
    }
}