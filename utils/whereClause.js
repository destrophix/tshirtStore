// base Product.find()
// query = //search=coder&page=2&category=shortsleeves&rating[gte]=4&price[lte]=999&price[gte]=499

class WhereClause {
  constructor(base, query) {
    (this.base = base), (this.query = query);
  }

  search() {
    const searchWord = this.query.search
      ? {
          name: {
            $regex: this.query.search,
            $options: "i",
          },
        }
      : {};
    this.base = this.base.find({ ...searchWord });
    return this;
  }

  filter() {
    const copyQuery = { ...this.query };
    delete copyQuery["search"];
    delete copyQuery["limit"];
    delete copyQuery["page"];

    let stringOfCopyQuery = JSON.stringify(copyQuery);

    stringOfCopyQuery = stringOfCopyQuery.replace(
      /\b(gte|lte|gt|lt)\b/g,
      (m) => `$${m}`
    );
    let jsonOfCopyQuery = JSON.parse(stringOfCopyQuery);

    this.base = this.base.find(jsonOfCopyQuery);
    return this;
  }

  pager(resultPerPage) {
    let currentPage = this.query.page || 1;
    let skipVal = resultPerPage * (currentPage - 1);

    this.base = this.base.limit(resultPerPage).skip(skipVal);
    return this;
  }
}

module.exports = WhereClause;
