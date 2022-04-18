const sayHello = (variables) => {
  return `
  <div>
   <h2>Hello ${variables.name}</h2>
   <p>You are ${variables.age}</p>
  </div>
  `;
};


const templateVars = {
  name: 'Blob', age: 23, birthday: 48
};
const result = sayHello(templateVars);
console.log(result);