import express, { json } from 'express'
import { PrismaClient } from '@prisma/client'
import cors from 'cors'

const app = express();
app.use(express.json());
// app.use(express.urlencoded({extended:false}));
app.use(cors());

const prisma = new PrismaClient();
const port = 8081;

app.get('/', (req, res) => {
    res.json(`Server ${port}`);
});

//read

app.get('/list', async (req, res) => {
    const list = await prisma.assign_designation.findMany();
    res.status(200).json(list);
});

// app.get('/showid', async (req, res) => {
//     try {
//         const id = await prisma.employees.findFirst({
//             where: {
//                 emp_num: '088176123',
//             },
//             select: {
//                 id: true,
//             },
//         });
//         res.status(200).json(id);
//         console.log("success!");
//     }
//     catch (err) {
//         console.log(err);
//     }
// });

app.get('/deps', async (req, res) => {
    try {
        const dep = await prisma.departments.findMany();
        res.status(200).json(dep);
    }
    catch (err) {
        console.log(err);
    }
});

app.get('/des', async (req, res) => {
    try {
        const dep = await prisma.designation.findMany();
        res.status(200).json(dep);
    }
    catch (err) {
        console.log(err);
    }
});

app.get('/emp/:id', async (req, res) => {
    const empId = req.params.id
    try {

        const emp = await prisma.employees.findFirst({
            where: {
                id: parseInt(empId),
            },
            include: {
                ass_des: {
                    select: {
                        designationName: true,
                        designationDepartment: true,
                        emp_type: true,
                        status: true,
                    }
                }
            }
        });

        res.status(200).json(emp);
        console.log("success!");
    }
    catch (err) {
        console.log(err);
    }
});

//create

app.post('/addDeparment', async (req, res) => {
    try {
        await prisma.departments.create({
            data: {
                dept_name: req.body.depName,
                status: 'ACTIVE',
            }
        })
        console.log("success!");
    }
    catch (err) {
        console.log(err);
    }
});

app.post('/addDesignation', async (req, res) => {
    try {
        await prisma.designation.create({
            data: {
                designation_name: req.body.desName,
                department: {
                    connect: {
                        dept_name: req.body.depName,
                    }
                },
            },
            include: { department: true }
        })
        console.log("success!");
    }
    catch (err) {
        console.log(err);
    }
});

app.post('/createEmp', async (req, res) => { //sabay na ang assign_department
    try {
        await prisma.employees.create({
            data: {
                emp_num: req.body.emp_num,
                firstname: req.body.firstname,
                midname: req.body.midname,
                lastname: req.body.lastname,
                addressline: req.body.addressline,
                brgy: req.body.brgy, 
                province: req.body.province,
                country: req.body.country,
                zipcode: req.body.zipcode
            }
        });

        var idEmp = await prisma.employees.findFirst({
            where: {
                emp_num: req.body.emp_num,
            },
            select: {
                id: true,
            },
        });

        await prisma.assign_designation.create({
            data: {
                emp_type: 'regular',
                status: 'ACTIVE',
                designation: {
                    connect: { id: 1 }
                },
                emp: {
                    connect: idEmp
                }
            },
            include: {emp: true, designation: true},
        });
        console.log("success!");
    }
    catch (err) {
        console.log(err);
    }
});

//update
app.post('/updDep', async (req, res) => {
    try {
        const upd = await prisma.departments.update({
            where: {
                id: req.body.id
            },
            data: {
                status: req.body.statusDep,
            }
        });
        console.log("success!");
    }
    catch (err) {
        console.log(err);
    }
});

//delete


//tests
app.listen(port, () => {
    console.log(`Server ${port}`);
});

async function createEmp() {
    try {
        const list = await prisma.assign_designation.create({
            data: {
                emp_type: 'regular',
                status: 'AWOL',
                designation: {
                    connect: { id: 1 }
                },
                emp: {
                    connect: { id: 3 }
                }
            },
            include: {emp: true, designation: true},
        });
        console.log("success!");
    }
    catch (err) {
        console.log(err);
    }
}

async function createEmp2() {
    try {
        await prisma.employees.findFirst({
            where: {
                emp_num: '088176123',
            },
        });
        console.log("success!");
    }
    catch (err) {
        console.log(err);
    }
}

async function getIdEmp() {
    try {
        await prisma.employees.findFirst({
            where: {
                emp_num: '088176123',
            },
        });
        console.log("success!");
    }
    catch (err) {
        console.log(err);
    }
}

async function deleteEmp() {
    try {
        const list = await prisma.assign_designation.delete({
            where: {
                id: 5
            },
        })
        console.log("success!");
        return
    }
    catch (err) {
        console.log(err);
    }
}

async function updateDep() {
    try {
        const upd = await prisma.departments.update({
            where: {
                id: 1
            },
            data: {
                status: 'ACTIVE',
            }
        });
        console.log("success!");
    }
    catch (err) {
        console.log(err);
    }
}

updateDep();