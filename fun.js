let obj1 = {
  _id: 1,
  name: "rohit",
};

let obj2 = {
  ...obj1,
  id: obj1._id,
};

console.log(obj2);
