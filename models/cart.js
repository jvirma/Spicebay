module.exports = function Cart(oldCart) {
    this.items = oldCart.items || {};
    this.itemsQty = oldCart.itemsQty || 0;
    this.totalPrice = oldCart.totalPrice || 0;

    this.add = function (item, ID) {

        if (!this.items[ID]) {
            this.itemsQty++;
        }

        var storedItem = this.items[ID];
        if (!storedItem) {
            storedItem = this.items[ID] = { item: item, qty: 0, price: parseFloat(item.cost), totalprice: parseFloat(0)};
        }
        storedItem.qty = 100;
        storedItem.totalprice = storedItem.qty * item.cost;

        storedItem.totalprice = storedItem.totalprice.toFixed(4);
        storedItem.totalprice = parseFloat(storedItem.totalprice);
        this.totalPrice += storedItem.qty * item.cost;
        this.totalPrice.toFixed(4);
    };


    this.updateCart = function (ID, quantity) {
        this.totalPrice -= this.items[ID].item.cost * this.items[ID].qty;
        this.items[ID].qty = quantity;
        this.items[ID].totalprice = this.items[ID].item.cost * this.items[ID].qty;
        this.items[ID].totalprice.toFixed(4);

        this.totalPrice += this.items[ID].price * quantity;
        this.totalPrice.toFixed(4);




    }

    this.removeItem = function (ID) {
        this.totalPrice -= this.items[ID].item.cost * this.items[ID].qty;
        this.totalPrice.toFixed(4);
        this.itemsQty--;
        delete this.items[ID];
    };

    this.generateArray = function () {
        var arr = [];
        for (var ID in this.items) {
            arr.push(this.items[ID]);
        }
        return arr;
    };
};
