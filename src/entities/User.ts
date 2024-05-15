import {
    Entity,
    Column,
    UpdateDateColumn,
    BaseEntity,
    CreateDateColumn,
    PrimaryColumn,
  } from "typeorm"
  
  @Entity()
  export class User extends BaseEntity {
    @PrimaryColumn()
    id!: string;
  
    @Column()
    name!: string;
  
    @Column({ unique: true })
    email!: string;
  
    @Column()
    password!: string;

    @Column()
    mnemonic!: string;

    @Column()
    address!: string;

    @Column()
    private_key!: string;

    @Column({  default: 0 })
    amount!: number;

    @Column({  default: 0 })
    steps!: number;
  
    @Column({  default: 0 })
    tokens!: number;

    @UpdateDateColumn()
    updateDate!: string;
  
    @CreateDateColumn()
    createDate!: string;
  }
  