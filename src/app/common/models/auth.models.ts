
export interface AuthInfo {
  name :string;
}

export class User {

  name : string;

  constructor({name}) {
    this.name = name || "";
  }

  toJSON() : string {
    return JSON.stringify({
      name: this.name
    })
  }

  static fromJSON(jsonData: string) : User {
    return new User(JSON.parse(jsonData))
  }

}