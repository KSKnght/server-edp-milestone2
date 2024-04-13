import express, { json } from 'express'
import { PrismaClient } from '@prisma/client'
import cors from 'cors'
import { connect } from 'tls';

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(cors());

const prisma = new PrismaClient();
const port = 8081;

app.get('/', (req, res) => {
    res.json(`Server ${port}`);
});

//read

app.get('/list', async (req, res) => {
    // const list = await prisma.assign_designation.findMany();
    const emp = await prisma.employees.findMany({
        select:{
            id: true,
            emp_num: true,
            lastname: true,
            firstname: true,
                ass_des: {
                    select: {
                        designationName: true,
                        DepartmentName: true,
                        status: true
                    }
                }
        },
        
    });
    res.status(200).json(emp);
});

app.get('/leaves', async (req, res) => {
    // const list = await prisma.assign_designation.findMany();
    const emp = await prisma.leaves.findMany({
        include: {
            emp: {
                select: {
                    lastname: true,
                    firstname: true
                }
            }
        }
    });
    res.status(200).json(emp);
});

app.get('/sign', async (req, res) => {
    // const list = await prisma.assign_designation.findMany();
    const emp = await prisma.signatories.findMany({
        select: {
            emp_num: true,
            status: true,
            emp: {
                select: {
                    firstname: true,
                    lastname: true
                }
            },
            sup: {
                select: {
                    emp: {
                        select: {
                            firstname: true,
                            lastname: true
                        }
                    }
                }
            }
        }
    })
    res.status(200).json(emp);
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
                id: Number(empId),
            },
            include: {
                ass_des: {
                    select: {
                        designationName: true,
                        DepartmentName: true,
                        emp_type: true,
                        status: true,
                    }
                }
            }
        });

        res.status(200).json(emp);
    }
    catch (err) {
        console.log(err);
    }
});

app.get('/desPerDep/', async (req, res) => {

    const des = await prisma.departments.findMany({
        select: {
            dept_name: true,
            id: true,
            designation: {
                select: {
                    designation_name: true
                }
            }
        }
    })

    res.status(200).json(des);

})

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

app.post('/addSignatory', async (req, res) => {
    try {
        console.log("hi!")
        const q = await prisma.assign_designation.findFirst({
            where: {
                empNum: req.body.signtory
            }
        })
    
        const r = await prisma.signatories.create({
            data: {
                emp: {
                    connect: {
                        emp_num: req.body.emp_num
                    }
                },
                sup: {
                    connect: {
                        id: q.id
                    }
                }
            }
        })
        console.log("success!");
    }
    catch (err) {
        console.log(err);
    }
});

app.post('/addLeave', async (req, res) => {
    try {
        console.log("hi!")
    
        const r = await prisma.leaves.create({
            data: {
                start_leave: req.body.start_leave,
                end_leave: req.body.end_leave,
                leaveType: req.body.leaveType,
                status: req.body.status,
                emp: {
                    connect: {
                        emp_num: req.body.emp_num
                    }
                }
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

        const idEmp = await prisma.employees.findFirst({
            where: {
                emp_num: req.body.emp_num,
            },
            select: {
                id: true,
            },
        });

        var isConnected = false
        
        const r = await prisma.designation.findFirst({
            where: {
                designation_name: req.body.designationName
            },
            select: {
                id: true,
                designation_name: true,
                department: true
            }
        })

        for (let i = 0; i < r.department.length; i++) {
            if (r.department[i] == req.body.department)
                isConnected = true
        } 

        const p = await prisma.departments.findFirst({
            where: {
                dept_name: req.body.designationDepartment
            }
        })
        

        if (isConnected == false) {
            await prisma.designation.update({
                where: {
                    designation_name: req.body.designationName
                },
                data: {
                    department: {
                        connect: {
                            id: p.id
                        }
                    }
                }
            })
        }

        await prisma.assign_designation.create({
            data: {
                emp_type: 'REGULAR',
                status: 'ACTIVE',
                designation: {
                    connect: {
                        designation_name: req.body.designationName
                    }
                },
                emp: {
                    connect: idEmp
                },
                department: {
                    connect: {
                        id: p.id
                    }
                }
            },
            include: {emp: true, designation: true, department: true},
        });
        console.log("success!");
    }
    catch (err) {
        console.log(err);
    }
});


//update
app.post('/upd/:id', async (req, res) => {
    try {
        await prisma.departments.update({
            where: {
                id: Number(req.params.id)
            },
            data: {
                status: req.body.statusDep,
            }
        });
    }
    catch (err) {
        console.log(err);
    }
});

app.post('/statusLeave/:id', async (req, res) => {
    try {
        await prisma.leaves.update({
            where: {
                id: Number(req.params.id)
            },
            data: {
                status: req.body.status
            }
        })
    }
    catch (err) {
        console.log(err);
    }
});

app.post('/updEmp/:id', async (req, res) => {
    try {

        // update employee table
        await prisma.employees.update({
            where: {
                id: Number(req.params.id)
            },
            data: {
                emp_num: req.body.emp_num,
                firstname: req.body.firstname,
                midname: req.body.midname,
                lastname: req.body.lastname,
                addressline: req.body.addressline,
                brgy: req.body.brgy,
                province: req.body.province,
                country: req.body.country,
                zipcode: req.body.zipcode,
            },
        });

        // get key for assign_designation of the employee
        const a = await prisma.assign_designation.findFirst({
            where: {
                empNum: req.body.emp_num
            },
        });

        // update the assign_designation.status of that employee
        await prisma.assign_designation.update({
            where: {
                id: a.id,
            },
            data: {
                status: req.body.status,
            }
        })

        var isConnected = false
        
        const t = await prisma.designation.findFirst({
            where: {
                designation_name: req.body.designationName
            },
            select: {
                id: true,
                designation_name: true,
                department: true
            }
        })

        const s = await prisma.departments.findFirst({
            where: {
                dept_name: req.body.designationDepartment
            }
        })

        for (let i = 0; i < t.department.length; i++) {
            if (t.department[i] == req.body.department)
                isConnected = true
        } 
        if (isConnected == false) {
            await prisma.designation.update({
                where: {
                    designation_name: req.body.designationName
                },
                data: {
                    department: {
                        connect: {
                            id: s.id
                        }
                    }
                }
            })
        }

        // check if the designation exists or is not connected to that department
        if (req.body.designationName != a.designationName) {     
            // get key for designation id
            const r = await prisma.designation.findFirst({
                where: {
                    designation_name: req.body.designationName,
                }
            })

            await prisma.assign_designation.update({
                where: {
                    id: a.id
                },
                data: {
                    designation: {
                        connect: {
                        designation_name: req.body.designationName }
                    }
                },
                include: {designation: true}
            })

            console.log('nag update ang designation')
        } 

        if (req.body.designationDepartment != a.designationDepartment) {
            // get key for department id
            const p = await prisma.departments.findFirst({
                where: {
                    dept_name: req.body.designationDepartment
                }
            })

            await prisma.assign_designation.update({
                where: {
                    id: a.id
                },
                data: {
                    department: {
                        connect: {
                            dept_name: req.body.designationDepartment
                        }
                    }
                },
                include: {department: true}
            })

            console.log('nag update ang department?')
        }

        console.log('nag update?')
        console.log(req.body.num);
    }
    catch (err) {
        console.log(err);
    }
});

//delete
app.post('/delEmp', async (req, res) => {
    try {
        const empnum = await prisma.employees.findFirst({
            where: {
                id: Number(req.body.id)
            },
            select: {
                emp_num: true,
            }
        })
        
        await prisma.assign_designation.deleteMany({
            where: {
                empNum: empnum.emp_num,
            }
        })
    
        await prisma.employees.delete({
            where: {
                emp_num: empnum.emp_num,
            }
        }) 
        console.log('delete')
    } catch (error) {
        console.log(error)
    }
    
});

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
                    connectOrCreate: { id: 1 }
                },
                emp: {
                    connect: { id: 102 }
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
                status: 'INACTIVE',
            }
        });
        console.log("success!");
    }
    catch (err) {
        console.log(err);
    }
}

async function delEmp() {
    const empnum = await prisma.employees.findFirst({
        where: {
            id: 21,
        },
        select: {
            emp_num: true,
        }
    })
    
    await prisma.assign_designation.deleteMany({
        where: {
            empNum: empnum.emp_num,
        }
    })

    await prisma.employees.delete({
        where: {
            emp_num: empnum.emp_num,
        }
    })
    console.log('deleted!')
}

async function tryUpd() {
    const a = await prisma.assign_designation.findFirst({
        where: {
            empNum: 'kweqwepqojqwe'
        },
    });

    // await prisma.assign_designation.update({
    //     where: {
    //         id: a.id,
    //     },
    //     data: {
    //         status: 'AWOL',
    //         designation: {
    //             department: {
    //                 connectOrCreate: { id: 3}
    //             }
    //         }
    //     },
    //     include: {designation: true}
    // })

    const r = await prisma.designation.findFirst({
        where: {
            designation_name: 'Back',
            departmentName: 'DS'
        }
    })

    if (r == null) {
        await prisma.designation.create({
            data: {
                designation_name: 'Back',
                department: {
                    connect: { id: 3 }
                }
            }
        })
    }

    await prisma.assign_designation.update({
        where: {
            id: 6
        },
        data: {
            designation: {
                connect: { designation_name_departmentName: {
                    departmentName: 'DS',
                    designation_name: 'Back'
                } }
            }
        },
        include: {designation: true}
    })

    console.log(r)
}

async function getdeps() {
    const q = await prisma.leaves.update({
        where: {
            id: 1
        },
        data: {
            status: 'APPROVED'
        }
    })

    // const r = await prisma.leaves.findMany({})

    // console.log(q[0].start_leave.toLocaleDateString())
}

// getdeps()
// tryUpd()
// createEmp()
// delEmp() 

