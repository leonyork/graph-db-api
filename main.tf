variable "region" {
  default = "us-east-1"
}
variable "stage" {
  default = "dev"
}
variable "service" {
  default = "graph-db-api"
}
variable "neo4j_core_count" {
  default = 3
}
variable "neo4j_core_type" {
  default = "t2.micro"
}
variable "neo4j_volume_size" {
  default = 20
}

provider "aws" {
  region = "${var.region}"
}

resource "aws_vpc" "vpc" {
  cidr_block = "10.0.0.0/16"
}

resource "aws_subnet" "subnet" {
  vpc_id     = "${aws_vpc.vpc.id}"
  cidr_block = "10.0.1.0/24"
}

module "ssh_key_pair" {
  source                = "github.com/cloudposse/terraform-aws-key-pair?ref=master"
  namespace             = "${var.service}"
  stage                 = "${var.stage}"
  name                  = "${var.service}"
  ssh_public_key_path   = "./secrets"
  generate_ssh_key      = "true"
}
module "neo4j" {
  source             = "github.com/leonyork/terraform-neo4j?ref=master"
  project            = "${var.service}"
  environment        = "${terraform.workspace}"
  name               = "${var.service}"
  key_name           = "${module.ssh_key_pair.key_name}"
  volume_size        = "${var.neo4j_volume_size}"
  vpc_id             = "${aws_vpc.vpc.id}"
  core_type          = "${var.neo4j_core_type}"
  subnet_ids         = ["${aws_subnet.subnet.id}"]
  backup_enabled     = false
  ami                = "ami-0de53d8956e8dcf80"
}