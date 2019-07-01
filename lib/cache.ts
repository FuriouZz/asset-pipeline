import { join, parse } from "path";
import { createHash } from "crypto";


export class Cache {

  enabled: boolean = false
  type: string = 'hash'
  key: string | number = 'no_key'

  hash(path: string) {
    const pathObject = parse(path)
    const hash = this.generateHash(path + this.key)
    return join(pathObject.dir, `${pathObject.name}-${hash}${pathObject.ext}`)
  }

  version(path: string) {
    const pathObject = parse(path)
    return join(pathObject.dir, `${pathObject.name}${pathObject.ext}?v=${this.key}`)
  }

  generateHash(str: string) {
    return createHash('md5').update(str).digest('hex')
  }

}