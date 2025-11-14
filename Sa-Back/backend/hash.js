import bcrypt from 'bcrypt';

const senha = "12345678";

const hash = await bcrypt.hash(senha, 12);
const hash2 = await bcrypt.hash(senha, 10);

bcrypt.compare(senha, hash).then(res => console.log(res))
bcrypt.compare(senha, hash2).then(res => console.log(res))
bcrypt.

console.log(senha)
console.log(hash)
console.log(hash2)



