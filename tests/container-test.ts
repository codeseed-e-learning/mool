import { Container } from "../packages/core/src/container";

class TestService {
  hello() {
    return "Hello";
  }
}

const service = new TestService();

const container = new Container();

container.bind(TestService, service);

const resolved = container.make(TestService);

console.log(service === resolved);