{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    dream2nix = {
      url = "github:nix-community/dream2nix?rev=fdd111cca7fae8470c9e2b4bcffe8dc1b2255a24";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs = inp:
  let
    flake = inp.dream2nix.lib.makeFlakeOutputs {
      systems = inp.flake-utils.lib.defaultSystems;
      config.projectRoot = ./.;
      source = ./.;
      # projects = ./projects.toml;
    };
  in flake // {
    devShells =
      inp.nixpkgs.lib.mapAttrs
      (system: shell: shell // {buildInputs = shell.buildInputs ++ [inp.nixpkgs.legacyPackages."${system}".esbuild]; })
      flake.devShells;
  };
}
