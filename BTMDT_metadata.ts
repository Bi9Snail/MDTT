import {
  Collection,
  CreateMetadataAccountV3InstructionAccounts,
  CreateMetadataAccountV3InstructionDataArgs,
  Creator,
  MPL_TOKEN_METADATA_PROGRAM_ID,
  UpdateMetadataAccountV2InstructionAccounts,
  UpdateMetadataAccountV2InstructionData,
  Uses,
  createMetadataAccountV3,
  updateMetadataAccountV2,
  findMetadataPda,
} from "@metaplex-foundation/mpl-token-metadata";
import * as web3 from "@solana/web3.js";
import {
  PublicKey,
  createSignerFromKeypair,
  none,
  signerIdentity,
  some,
} from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  fromWeb3JsKeypair,
  fromWeb3JsPublicKey,
} from "@metaplex-foundation/umi-web3js-adapters";

export function loadWalletKey(keypairFile: string): web3.Keypair {
  const fs = require("fs");
  const loaded = web3.Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync(keypairFile).toString()))
  );
  return loaded;
}

const INITIALIZE = false;

async function main() {
  //여기@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@부터
  console.log("metadata for MDTT token");
  const myKeypair = loadWalletKey(
    "D:/Solana_works/12_MDTT/wallet_MDTTRLuMXKAqy8be9HCtVk4FUVq7qPmLdwEB8t9Uq6q.json"
  );
  const mint = new web3.PublicKey(
    "MDTqY2C9YbvyyRxBSTiDgHg3tBPVpxDysY45C4jpd6h"
  );
  //여기@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@까지

  const umi = createUmi(
    "https://methodical-twilight-snow.solana-mainnet.quiknode.pro/693763d7e15a2a78fa6b08990c68f65ec798f120"
  );
  const signer = createSignerFromKeypair(umi, fromWeb3JsKeypair(myKeypair));
  umi.use(signerIdentity(signer, true));

  //여기@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@부터
  const ourMetadata = {
    // TODO change those values!
    name: "Meditation Coin",
    symbol: "MDTT",
    uri: "https://raw.githubusercontent.com/Bi9Snail/MDTT/main/MDTT_metadata.json",
  };
  //여기@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@까지
  const onChainData = {
    ...ourMetadata,
    // we don't need that
    sellerFeeBasisPoints: 0,
    creators: none<Creator[]>(),
    collection: none<Collection>(),
    uses: none<Uses>(),
  };
  if (INITIALIZE) {
    const accounts: CreateMetadataAccountV3InstructionAccounts = {
      mint: fromWeb3JsPublicKey(mint),
      mintAuthority: signer,
    };
    const data: CreateMetadataAccountV3InstructionDataArgs = {
      isMutable: true,
      collectionDetails: null,
      data: onChainData,
    };
    const txid = await createMetadataAccountV3(umi, {
      ...accounts,
      ...data,
    }).sendAndConfirm(umi);
    console.log(txid);
  } else {
    const data: UpdateMetadataAccountV2InstructionData = {
      data: some(onChainData),
      discriminator: 0,
      isMutable: some(true),
      newUpdateAuthority: none<PublicKey>(),
      primarySaleHappened: none<boolean>(),
    };
    const accounts: UpdateMetadataAccountV2InstructionAccounts = {
      metadata: findMetadataPda(umi, { mint: fromWeb3JsPublicKey(mint) }),
      updateAuthority: signer,
    };
    const txid = await updateMetadataAccountV2(umi, {
      ...accounts,
      ...data,
    }).sendAndConfirm(umi);
    console.log(txid);
  }
}

main();
