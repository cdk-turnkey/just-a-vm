import * as cdk from "@aws-cdk/core";
import * as ec2 from "@aws-cdk/aws-ec2";
import * as s3 from "@aws-cdk/aws-s3";
import { RemovalPolicy } from "@aws-cdk/core";

export interface StackProps extends cdk.StackProps {
  customProp?: string;
}
export class Stack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props: StackProps = {}) {
    super(scope, id, props);
    const { customProp } = props;
    const defaultBucketProps = {
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    };
    const bucket = new s3.Bucket(this, "Bucket", {
      ...defaultBucketProps,
      versioned: true,
    });
    const vpc = new ec2.Vpc(this, "VPC", {
      subnetConfiguration: [
        { name: "PublicSubnet", subnetType: ec2.SubnetType.PUBLIC },
      ],
    });
    const securityGroup = new ec2.SecurityGroup(this, "SG", {
      vpc,
      allowAllOutbound: true,
    });
    const AMI_WITH_INSTANCE_CONNECT_INSTALLED = "ami-04902260ca3d33422";
    const vm = new ec2.Instance(this, "VM", {
      instanceType: new ec2.InstanceType("t3.small"),
      machineImage: ec2.MachineImage.genericLinux({
        "us-east-1": AMI_WITH_INSTANCE_CONNECT_INSTALLED,
      }),
      vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
      securityGroup,
    });
    const EC2_INSTANCE_CONNECT_IP_RANGE_US_EAST_1 = "18.206.107.24/29";
    securityGroup.addIngressRule(
      ec2.Peer.ipv4(EC2_INSTANCE_CONNECT_IP_RANGE_US_EAST_1),
      ec2.Port.tcp(22),
      "allow ssh access from EC2_INSTANCE_CONNECT in us-east-1"
    );
    new cdk.CfnOutput(this, "BucketName", {
      value: bucket.bucketName,
    });
  }
}
