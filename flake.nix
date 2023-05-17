{
  inputs = {
    flake-utils.url = "github:numtide/flake-utils";
    dream2nix.url = "github:nix-community/dream2nix";
  };

  outputs = { flake-utils, dream2nix, ... }:
    dream2nix.lib.makeFlakeOutputs {
      systems = flake-utils.lib.defaultSystems;
      config.projectRoot = ./.;
      source = ./.;
      settings = [
        {
          subsystemInfo.nodejs = 18;
        }
      ];
      projects = ./projects.toml;
    };
}
