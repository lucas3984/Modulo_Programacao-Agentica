import Avatar from "./avatar.js";

export class Cowboy extends Avatar {
    constructor(x,y) {
        super(x,y);
        this._municao = 10;
        this._dano = 2
    }
    attack(){
        if(this.municao===0)
            return
        this.municao -= 1;
        super.attack();

    }
    addMunicao(valor){
        this.municao += valor;
    }

    get municao() {return this._municao}

    set municao(valor){
        this._municao = valor> 0? valor : 0 
    }
}

export class Mago extends Avatar{
    constructor(x,y){
        super(x,y);
        this._mana = 10
        this._dano = 3
    }

    attack(){
        if(this.mana===0){
            
            return new Promise(resolve => setTimeout(()=>{
                this.mana = 10
                resolve();
            }, 10 * 1000))
        }
        this.mana--
        super.attack
    }

    get mana(){return this._mana}
    set mana(valor){this._mana = valor > 0? valor : 0}
}
