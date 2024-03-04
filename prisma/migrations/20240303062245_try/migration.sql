-- CreateTable
CREATE TABLE "employees" (
    "id" SERIAL NOT NULL,
    "emp_num" VARCHAR(40) NOT NULL,
    "firstname" VARCHAR(40) NOT NULL,
    "midname" VARCHAR(40) NOT NULL,
    "lastname" VARCHAR(40) NOT NULL,
    "addressline" VARCHAR(40) NOT NULL,
    "brgy" VARCHAR(40) NOT NULL,
    "province" VARCHAR(40) NOT NULL,
    "country" VARCHAR(40) NOT NULL,
    "zipcode" INTEGER NOT NULL,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assign_designation" (
    "id" SERIAL NOT NULL,
    "empNum" VARCHAR(40) NOT NULL,
    "designationName" TEXT NOT NULL,
    "designationDepartment" TEXT NOT NULL,
    "emp_type" VARCHAR(40) NOT NULL,
    "status" VARCHAR(10) NOT NULL,

    CONSTRAINT "assign_designation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "designation" (
    "id" SERIAL NOT NULL,
    "designation_name" VARCHAR(40) NOT NULL,
    "departmentName" TEXT NOT NULL,
    "departmentStatus" TEXT NOT NULL,

    CONSTRAINT "designation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departments" (
    "in" SERIAL NOT NULL,
    "dept_name" VARCHAR(40) NOT NULL,
    "status" VARCHAR(15) NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("in")
);

-- CreateIndex
CREATE UNIQUE INDEX "employees_emp_num_key" ON "employees"("emp_num");

-- CreateIndex
CREATE UNIQUE INDEX "designation_designation_name_departmentName_key" ON "designation"("designation_name", "departmentName");

-- CreateIndex
CREATE UNIQUE INDEX "departments_dept_name_status_key" ON "departments"("dept_name", "status");

-- AddForeignKey
ALTER TABLE "assign_designation" ADD CONSTRAINT "assign_designation_empNum_fkey" FOREIGN KEY ("empNum") REFERENCES "employees"("emp_num") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assign_designation" ADD CONSTRAINT "assign_designation_designationName_designationDepartment_fkey" FOREIGN KEY ("designationName", "designationDepartment") REFERENCES "designation"("designation_name", "departmentName") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "designation" ADD CONSTRAINT "designation_departmentName_departmentStatus_fkey" FOREIGN KEY ("departmentName", "departmentStatus") REFERENCES "departments"("dept_name", "status") ON DELETE RESTRICT ON UPDATE CASCADE;
