let bigPromise = (func) => (req, res, next) => {
  Promise.resolve(func(req, res)).catch(next);
};

let fun = () => console.log("hello world");

bigPromise(fun());
console.log("google");
