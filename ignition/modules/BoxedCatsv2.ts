import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const BoxedCatsv2Module = buildModule("BoxedCatsv2Module", (m) => {
  const contract = m.contract("BoxedCatsv2");

  return { contract };
});

export default BoxedCatsv2Module;
