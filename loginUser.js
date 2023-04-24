
async function loginUser(email, password) {
    const response = await request(app)
      .post('/login')
      .send({ email, password });
  
    return response.body.token;
  }