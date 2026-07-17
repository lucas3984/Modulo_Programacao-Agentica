export default class Avatar {
    constructor(x, y) {
        // Usamos o prefixo "_" para indicar propriedade privada/interna
        this._x = x;
        this._y = y;
        this._moedas = 0;
        this._vida = 10;
        this._dano = 1;
    }

    addMoeda(valor) {
        if (!this.isAlive())
            return;
        if (valor > 0)
            this.moedas += valor;
    }

    attack() {
        if (!this.isAlive())
            return;
        return this.dano;
    }

    damaged(dano) {
        if (!this.isAlive())
            return;
        this.vida -= dano;
    }

    isAlive() {
        if (this.vida > 0)
            return true
        else
            return false
    }

    foward() {
        if (!this.isAlive())
            return;
        this.y += 1;
    }
    back() {
        if (!this.isAlive())
            return;
        this.y -= 1;
    }
    right() {
        if (!this.isAlive())
            return;
        this.x += 1;
    }
    left() {
        if (!this.isAlive())
            return;
        this.x -= 1;
    }


    get x() { return this._x; }
    get y() { return this._y; }
    get moedas() { return this._moedas; }
    get vida() { return this._vida; }
    get dano() { return this._dano; }


    set x(valor) { 
        if (valor < 0) this._x = 0;
        else if (valor > 27) this._x = 27;
        else this._x = valor;
    }

    set y(valor) { 
        if (valor < 0) this._y = 0;
        else if (valor > 12) this._y = 12;
        else this._y = valor;
    }
    set moedas(valor) {
        if (valor >= 0) this._moedas = valor;
    }

    set vida(valor) {
        // Exemplo de lógica no setter: impede vida negativa
        this._vida = valor < 0 ? 0 : valor;
    }

    set dano(valor) {
        if (valor > 0) this._dano = valor;
    }
}
